from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from core.database import get_db
from auth.jwt_auth import get_authenticated_jwt_user, require_mechanic
from users.models import UserModel
from vehicles.models import VehicleModel
from reports.models import IssueReportModel, IssueStatus, IssueCategory, AdminStatus
from reports.schemas import IssueReportCreateSchema, IssueReportOutSchema, IssueStatusUpdateSchema
from mechanics.models import MechanicModel
from notifications.service import notify
from typing import List, Optional

router = APIRouter(prefix="/reports", tags=["Issue Reports"])

ALLOWED_STATUS_TRANSITIONS = {
    IssueStatus.assigned: [IssueStatus.diagnosing, IssueStatus.cancelled],
    IssueStatus.diagnosing: [IssueStatus.waiting_for_visit, IssueStatus.cancelled],
    IssueStatus.waiting_for_visit: [IssueStatus.completed, IssueStatus.cancelled],
}


# ─── ثبت مشکل جدید (کاربر) ───────────────────────────────────────────────────
@router.post("/", response_model=IssueReportOutSchema, status_code=201)
async def create_report(
    request: IssueReportCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    vehicle = db.query(VehicleModel).filter_by(id=request.vehicle_id, owner_id=current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="خودرو یافت نشد یا متعلق به شما نیست")

    report = IssueReportModel(
        user_id=current_user.id,
        vehicle_id=request.vehicle_id,
        title=request.title,
        description=request.description,
        category=request.category,
        priority=request.priority,
    )
    
    # ─── اگر مکانیک مشخص شده، مستقیم assign کن ────────────────────────────
    if request.mechanic_id:
        mechanic = db.query(MechanicModel).filter_by(id=request.mechanic_id, is_verified=True).first()
        if mechanic:
            report.assigned_mechanic_id = mechanic.id
            report.status = IssueStatus.assigned
            # اطلاع‌رسانی به مکانیک
            notify(db, mechanic.user_id, "درخواست جدید", 
                   f"کاربر {current_user.full_name} درخواستی برای شما ثبت کرد", report_id=report.id)
            print(f"✅ Report assigned to mechanic {mechanic.id} - {mechanic.full_name}")
    
    # ─── مقداردهی tracking_code ────────────────────────────────────────────
    report.set_tracking_code()
    
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# ─── تاریخچه مشکلات کاربر (پنل کاربر) ───────────────────────────────────────
@router.get("/my", response_model=List[IssueReportOutSchema])
async def my_reports(
    status_filter: Optional[IssueStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    query = db.query(IssueReportModel).filter_by(user_id=current_user.id)
    if status_filter:
        query = query.filter(IssueReportModel.status == status_filter)
    return query.order_by(IssueReportModel.created_at.desc()).all()


# ─── درخواست‌های در انتظار (پنل مکانیک — با فیلتر تخصص) ─────────────────────
@router.get("/available", response_model=List[IssueReportOutSchema])
async def available_reports(
    category: Optional[IssueCategory] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_mechanic),
):
    mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
    if not mechanic or not mechanic.is_verified:
        raise HTTPException(status_code=403, detail="حساب مکانیک تأیید نشده است")

    query = db.query(IssueReportModel).filter(
        IssueReportModel.status == IssueStatus.pending,
        IssueReportModel.assigned_mechanic_id == None,
    )

    # اگر فیلتر دستی داده نشد، بر اساس تخصص فیلتر کن
    if category:
        query = query.filter(IssueReportModel.category == category)
    elif mechanic.specializations:
        slugs = [s.slug for s in mechanic.specializations]
        query = query.filter(IssueReportModel.category.in_(slugs))

    return query.order_by(IssueReportModel.created_at.desc()).all()


# ─── درخواست‌های assigned به این مکانیک (پنل مکانیک) ─────────────────────────
@router.get("/my-assigned", response_model=List[IssueReportOutSchema])
async def my_assigned_reports(
    status_filter: Optional[IssueStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_mechanic),
):
    mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="پروفایل مکانیک یافت نشد")

    query = db.query(IssueReportModel).filter_by(assigned_mechanic_id=mechanic.id)
    if status_filter:
        query = query.filter(IssueReportModel.status == status_filter)
    return query.order_by(IssueReportModel.updated_at.desc()).all()


# ─── قبول درخواست توسط مکانیک (atomic — first accept wins) ───────────────────
@router.post("/{report_id}/accept")
async def accept_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_mechanic),
):
    mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
    if not mechanic or not mechanic.is_verified:
        raise HTTPException(status_code=403, detail="حساب مکانیک تأیید نشده است")

    report = db.execute(
        select(IssueReportModel)
        .where(IssueReportModel.id == report_id)
        .with_for_update()
    ).scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")
    if report.assigned_mechanic_id is not None:
        raise HTTPException(status_code=409, detail="این درخواست قبلاً توسط مکانیک دیگری قبول شده است")
    if report.status != IssueStatus.pending:
        raise HTTPException(status_code=409, detail="وضعیت درخواست امکان قبول کردن را نمی‌دهد")

    report.assigned_mechanic_id = mechanic.id
    report.status = IssueStatus.assigned
    db.commit()

    # اطلاع‌رسانی به کاربر
    notify(db, report.user_id, "درخواست شما قبول شد",
           f"مکانیک {mechanic.full_name} درخواست شما را قبول کرد", report_id=report_id)

    return JSONResponse(content={"detail": "درخواست با موفقیت قبول شد"})


# ─── جزئیات یک درخواست ───────────────────────────────────────────────────────
@router.get("/{report_id}", response_model=IssueReportOutSchema)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    report = db.query(IssueReportModel).filter_by(id=report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")

    if current_user.is_mechanic:
        mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
        if report.assigned_mechanic_id != mechanic.id:
            raise HTTPException(status_code=403, detail="دسترسی ندارید")
    elif not current_user.is_admin:
        if report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="دسترسی ندارید")

    return report


# ─── تغییر وضعیت توسط مکانیک ─────────────────────────────────────────────────
@router.patch("/{report_id}/status")
async def update_status(
    report_id: int,
    request: IssueStatusUpdateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_mechanic),
):
    mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
    report = db.query(IssueReportModel).filter_by(id=report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")
    if report.assigned_mechanic_id != mechanic.id:
        raise HTTPException(status_code=403, detail="فقط مکانیک assigned می‌تواند وضعیت را تغییر دهد")

    allowed = ALLOWED_STATUS_TRANSITIONS.get(report.status, [])
    if request.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"انتقال از '{report.status}' به '{request.status}' مجاز نیست"
        )

    old_status = report.status
    report.status = request.status
    db.commit()

    # اطلاع‌رسانی به کاربر
    status_labels = {
        IssueStatus.diagnosing: "در حال بررسی",
        IssueStatus.waiting_for_visit: "تاریخ مراجعه مشخص شد",
        IssueStatus.completed: "تعمیر انجام شد",
        IssueStatus.cancelled: "لغو شد",
    }
    label = status_labels.get(request.status, request.status.value)
    notify(db, report.user_id, "به‌روزرسانی وضعیت درخواست",
           f"وضعیت درخواست شما به «{label}» تغییر کرد", report_id=report_id)

    return JSONResponse(content={"detail": "وضعیت با موفقیت به‌روز شد"})


# ─── لغو توسط کاربر ──────────────────────────────────────────────────────────
@router.post("/{report_id}/cancel")
async def cancel_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    report = db.query(IssueReportModel).filter_by(id=report_id, user_id=current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")
    if report.status not in [IssueStatus.pending, IssueStatus.assigned]:
        raise HTTPException(status_code=400, detail="این درخواست قابل لغو نیست")

    report.status = IssueStatus.cancelled
    db.commit()
    return JSONResponse(content={"detail": "درخواست لغو شد"})
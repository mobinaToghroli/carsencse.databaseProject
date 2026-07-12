from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from core.database import get_db
from auth.jwt_auth import require_admin
from users.models import UserModel
from mechanics.models import MechanicModel
from reports.models import IssueReportModel
from specializations.models import SpecializationModel
from mechanics.schemas import MechanicOutSchema
from reports.schemas import IssueReportOutSchema
from users.schemas import UserOutSchema
from typing import List, Optional
from pydantic import BaseModel
from reviews.models import ReviewModel

router = APIRouter(prefix="/admin", tags=["Admin"])


class SpecializationCreateSchema(BaseModel):
    name: str
    slug: str


# ─── مدیریت مکانیک‌ها ────────────────────────────────────────────────────────
@router.get("/mechanics/pending", response_model=List[MechanicOutSchema])
async def pending_mechanics(
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    mechanics = db.query(MechanicModel).options(
        joinedload(MechanicModel.user),
        joinedload(MechanicModel.specializations),
    ).filter_by(is_verified=False).all()
    return mechanics


@router.post("/mechanics/{mechanic_id}/verify")
async def verify_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    mechanic = db.query(MechanicModel).filter_by(id=mechanic_id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="مکانیک یافت نشد")
    mechanic.is_verified = True
    db.commit()
    return JSONResponse(content={"detail": "مکانیک تأیید شد"})


@router.post("/mechanics/{mechanic_id}/revoke")
async def revoke_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    mechanic = db.query(MechanicModel).filter_by(id=mechanic_id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="مکانیک یافت نشد")
    mechanic.is_verified = False
    db.commit()
    return JSONResponse(content={"detail": "تأیید مکانیک لغو شد"})


# ─── مدیریت کاربران ──────────────────────────────────────────────────────────
@router.get("/users", response_model=List[UserOutSchema])
async def list_users(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    query = db.query(UserModel)
    if role:
        query = query.filter(UserModel.role == role)
    return query.order_by(UserModel.created_at.desc()).all()


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    user = db.query(UserModel).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    user.is_active = False
    db.commit()
    return JSONResponse(content={"detail": "کاربر غیرفعال شد"})


# ─── مدیریت درخواست‌ها ───────────────────────────────────────────────────────
@router.get("/reports")
async def all_reports(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    query = db.query(IssueReportModel).options(
        joinedload(IssueReportModel.user),
        joinedload(IssueReportModel.vehicle),
        joinedload(IssueReportModel.assigned_mechanic).joinedload(MechanicModel.user),
        joinedload(IssueReportModel.attachments),
    )
    if status:
        query = query.filter(IssueReportModel.status == status)
    
    reports = query.order_by(IssueReportModel.created_at.desc()).all()
    
    result = []
    for report in reports:
        # ─── اطلاعات کاربر ──────────────────────────────────────────────
        client_name = report.user.full_name if report.user else ""
        phone = report.user.phone if report.user else None
        
        # ─── اطلاعات خودرو ──────────────────────────────────────────────
        vehicle_model = ""
        plate_number = None
        if report.vehicle:
            vehicle_model = f"{report.vehicle.brand} {report.vehicle.model}"
            plate_number = report.vehicle.plate
        
        # ─── نام مکانیک ──────────────────────────────────────────────────
        mechanic_name = None
        if report.assigned_mechanic and report.assigned_mechanic.user:
            mechanic_name = report.assigned_mechanic.user.full_name
        
        # ─── گرفتن attachments ──────────────────────────────────────────
        images = []
        audio_files = []
        for att in report.attachments:
            if att.file_type == "image":
                images.append(att.file_path)
            elif att.file_type == "audio":
                audio_files.append(att.file_path)
        
        result.append({
            "id": report.id,
            "tracking_code": report.tracking_code,
            "description": report.description,
            "status": report.status,
            "admin_status": report.admin_status,
            "priority": report.priority,
            "created_at": report.created_at,
            "user": {
                "full_name": client_name,
                "phone": phone,
            },
            "vehicle": {
                "brand": report.vehicle.brand if report.vehicle else None,
                "model": report.vehicle.model if report.vehicle else None,
                "plate": plate_number,
            },
            "assigned_mechanic": {
                "user": {
                    "full_name": mechanic_name,
                }
            } if report.assigned_mechanic else None,
            "images": images,
            "audio_files": audio_files,
        })
    
    return result


# ─── آمار داشبورد ─────────────────────────────────────────────────────────────
@router.get("/stats")
async def dashboard_stats(
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    total_ratings = db.query(ReviewModel).count()
    verified_reports = db.query(IssueReportModel).filter(
        IssueReportModel.status.in_(["completed", "waiting_for_visit"])
    ).count()
    
    return {
        "total_users": db.query(UserModel).filter_by(role="user").count(),
        "total_mechanics": db.query(MechanicModel).count(),
        "verified_mechanics": db.query(MechanicModel).filter_by(is_verified=True).count(),
        "pending_mechanics": db.query(MechanicModel).filter_by(is_verified=False).count(),
        "total_reports": db.query(IssueReportModel).count(),
        "pending_reports": db.query(IssueReportModel).filter_by(status="pending").count(),
        "completed_reports": db.query(IssueReportModel).filter_by(status="completed").count(),
        "verified_reports": verified_reports,
        "total_ratings": total_ratings,
    }


# ─── مدیریت تخصص‌ها ──────────────────────────────────────────────────────────
@router.get("/specializations")
async def list_specializations(db: Session = Depends(get_db)):
    return db.query(SpecializationModel).all()


@router.post("/specializations", status_code=201)
async def create_specialization(
    request: SpecializationCreateSchema,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    existing = db.query(SpecializationModel).filter_by(slug=request.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="این تخصص قبلاً ثبت شده است")
    spec = SpecializationModel(name=request.name, slug=request.slug)
    db.add(spec)
    db.commit()
    return JSONResponse(content={"detail": "تخصص اضافه شد"}, status_code=201)


@router.delete("/specializations/{spec_id}", status_code=204)
async def delete_specialization(
    spec_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    spec = db.query(SpecializationModel).filter_by(id=spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="تخصص یافت نشد")
    db.delete(spec)
    db.commit()
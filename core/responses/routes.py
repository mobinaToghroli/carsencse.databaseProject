from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from auth.jwt_auth import get_authenticated_jwt_user
from users.models import UserModel
from reports.models import IssueReportModel, IssueStatus
from responses.models import ResponseModel
from responses.schemas import ResponseCreateSchema, ResponseOutSchema
from mechanics.models import MechanicModel
from notifications.service import notify
from typing import List

router = APIRouter(prefix="/reports/{report_id}/responses", tags=["Responses"])


def _get_accessible_report(report_id: int, current_user: UserModel, db: Session) -> IssueReportModel:
    report = db.query(IssueReportModel).filter_by(id=report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")

    if current_user.is_mechanic:
        mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
        if report.assigned_mechanic_id != (mechanic.id if mechanic else None):
            raise HTTPException(status_code=403, detail="دسترسی ندارید")
    elif not current_user.is_admin:
        if report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="دسترسی ندارید")

    return report


@router.get("/", response_model=List[ResponseOutSchema])
async def list_responses(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    _get_accessible_report(report_id, current_user, db)
    return db.query(ResponseModel).filter_by(report_id=report_id).order_by(ResponseModel.created_at).all()


@router.post("/", response_model=ResponseOutSchema, status_code=201)
async def add_response(
    report_id: int,
    request: ResponseCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    report = _get_accessible_report(report_id, current_user, db)

    if report.status in [IssueStatus.completed, IssueStatus.cancelled]:
        raise HTTPException(status_code=400, detail="نمی‌توان به درخواست بسته‌شده پاسخ داد")

    if not current_user.is_mechanic and (request.estimated_cost or request.visit_date):
        raise HTTPException(status_code=403, detail="فقط مکانیک می‌تواند هزینه و تاریخ مراجعه ثبت کند")

    response = ResponseModel(
        report_id=report_id,
        sender_id=current_user.id,
        message=request.message,
        estimated_cost=request.estimated_cost if current_user.is_mechanic else None,
        estimated_duration=request.estimated_duration if current_user.is_mechanic else None,
        visit_date=request.visit_date if current_user.is_mechanic else None,
    )
    db.add(response)

    # اگر مکانیک تاریخ مراجعه ثبت کرد، وضعیت را تغییر بده
    if current_user.is_mechanic and request.visit_date:
        if report.status == IssueStatus.diagnosing:
            report.status = IssueStatus.waiting_for_visit

    db.commit()
    db.refresh(response)

    # اطلاع‌رسانی
    if current_user.is_mechanic:
        notify(db, report.user_id, "پاسخ جدید از مکانیک",
               "مکانیک به درخواست شما پاسخ داد", report_id=report_id)
    else:
        if report.assigned_mechanic_id:
            mechanic = db.query(MechanicModel).filter_by(id=report.assigned_mechanic_id).first()
            if mechanic:
                notify(db, mechanic.user_id, "پیام جدید از کاربر",
                       "کاربر یک پیام جدید فرستاد", report_id=report_id)

    return response

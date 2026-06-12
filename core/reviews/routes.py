from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from auth.jwt_auth import get_authenticated_jwt_user
from users.models import UserModel
from reports.models import IssueReportModel, IssueStatus
from reviews.models import ReviewModel
from reviews.schemas import ReviewCreateSchema, ReviewOutSchema
from mechanics.models import MechanicModel
from typing import List

router = APIRouter(tags=["Reviews"])


# ─── ثبت ریویو توسط کاربر (بعد از تکمیل) ──────────────────────────────────
@router.post("/reports/{report_id}/review", response_model=ReviewOutSchema, status_code=201)
async def submit_review(
    report_id: int,
    request: ReviewCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    report = db.query(IssueReportModel).filter_by(id=report_id, user_id=current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")
    if report.status != IssueStatus.completed:
        raise HTTPException(status_code=400, detail="فقط پس از اتمام تعمیر می‌توان امتیاز داد")
    if report.review:
        raise HTTPException(status_code=409, detail="قبلاً امتیاز داده شده است")

    review = ReviewModel(
        report_id=report_id,
        user_id=current_user.id,
        mechanic_id=report.assigned_mechanic_id,
        rating=request.rating,
        comment=request.comment,
    )
    db.add(review)

    # به‌روزرسانی میانگین امتیاز مکانیک
    mechanic = db.query(MechanicModel).filter_by(id=report.assigned_mechanic_id).first()
    if mechanic:
        all_ratings = [r.rating for r in mechanic.reviews] + [request.rating]
        mechanic.average_rating = round(sum(all_ratings) / len(all_ratings), 2)
        mechanic.total_completed = len([r for r in mechanic.reviews if r]) + 1

    db.commit()
    db.refresh(review)
    return review


# ─── ریویوهای یک مکانیک ──────────────────────────────────────────────────────
@router.get("/mechanics/{mechanic_id}/reviews", response_model=List[ReviewOutSchema])
async def mechanic_reviews(mechanic_id: int, db: Session = Depends(get_db)):
    mechanic = db.query(MechanicModel).filter_by(id=mechanic_id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="مکانیک یافت نشد")
    return db.query(ReviewModel).filter_by(mechanic_id=mechanic_id).order_by(ReviewModel.created_at.desc()).all()

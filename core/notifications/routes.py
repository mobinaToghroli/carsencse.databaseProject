from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from auth.jwt_auth import get_authenticated_jwt_user
from users.models import UserModel
from notifications.models import NotificationModel
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationOutSchema(BaseModel):
    id: int
    title: str
    body: str
    is_read: bool
    report_id: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/", response_model=List[NotificationOutSchema])
async def my_notifications(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    return (
        db.query(NotificationModel)
        .filter_by(user_id=current_user.id)
        .order_by(NotificationModel.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/unread-count")
async def unread_count(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    count = db.query(NotificationModel).filter_by(user_id=current_user.id, is_read=False).count()
    return {"unread": count}


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    notif = db.query(NotificationModel).filter_by(id=notification_id, user_id=current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return JSONResponse(content={"detail": "خوانده شد"})


@router.post("/read-all")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    db.query(NotificationModel).filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.commit()
    return JSONResponse(content={"detail": "همه خوانده شدند"})

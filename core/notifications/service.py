"""
سرویس ساده نوتیفیکیشن — در دیتابیس ذخیره می‌کند.
در آینده می‌توان WebSocket یا FCM push به آن اضافه کرد.
"""
from sqlalchemy.orm import Session
from notifications.models import NotificationModel


def notify(
    db: Session,
    user_id: int,
    title: str,
    body: str,
    report_id: int = None,
) -> None:
    notif = NotificationModel(
        user_id=user_id,
        title=title,
        body=body,
        report_id=report_id,
    )
    db.add(notif)
    db.commit()

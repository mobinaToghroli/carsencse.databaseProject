from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_id = Column(Integer, ForeignKey("issue_reports.id"), nullable=True)

    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("UserModel", back_populates="notifications")

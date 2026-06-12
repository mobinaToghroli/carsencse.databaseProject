from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum


class IssueCategory(str, enum.Enum):
    engine = "engine"
    gearbox = "gearbox"
    electrical = "electrical"
    brakes = "brakes"
    cooling = "cooling"
    steering = "steering"
    body = "body"
    suspension = "suspension"
    exhaust = "exhaust"
    other = "other"


class IssuePriority(str, enum.Enum):
    normal = "normal"
    urgent = "urgent"
    emergency = "emergency"


class IssueStatus(str, enum.Enum):
    pending = "pending"                          # منتظر مکانیک
    assigned = "assigned"                        # مکانیک قبول کرد
    diagnosing = "diagnosing"                    # در حال بررسی
    waiting_for_visit = "waiting_for_visit"      # تاریخ مراجعه مشخص شد
    completed = "completed"                      # تعمیر انجام شد
    cancelled = "cancelled"                      # لغو شد


class IssueReportModel(Base):
    __tablename__ = "issue_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    assigned_mechanic_id = Column(Integer, ForeignKey("mechanics.id"), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(IssueCategory), nullable=False)
    priority = Column(Enum(IssuePriority), default=IssuePriority.normal)
    status = Column(Enum(IssueStatus), default=IssueStatus.pending)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations
    user = relationship("UserModel", back_populates="reports", foreign_keys=[user_id])
    vehicle = relationship("VehicleModel", back_populates="reports")
    assigned_mechanic = relationship(
        "MechanicModel",
        back_populates="assigned_reports",
        foreign_keys=[assigned_mechanic_id],
    )
    attachments = relationship("AttachmentModel", back_populates="report", cascade="all, delete-orphan")
    responses = relationship("ResponseModel", back_populates="report", cascade="all, delete-orphan")
    review = relationship("ReviewModel", back_populates="report", uselist=False)

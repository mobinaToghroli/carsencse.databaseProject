from sqlalchemy import Column, String, Integer, Boolean, Float, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
from specializations.models import mechanic_specializations
import enum


# ─── Enum برای وضعیت تأیید ──────────────────────────────────────────────────
class MechanicApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class MechanicModel(Base):
    __tablename__ = "mechanics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    bio = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)           # شهر محل کار
    years_of_experience = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)

    # ─── فیلدهای جدید برای فرانت ───────────────────────────────────────────
    workshop_name = Column(String(200), nullable=True)      # نام تعمیرگاه
    address = Column(String(300), nullable=True)            # آدرس
    national_id = Column(String(20), nullable=True)         # کد ملی
    approval_status = Column(                               # وضعیت تأیید (برای فرانت)
        SQLEnum(MechanicApprovalStatus),
        default=MechanicApprovalStatus.pending
    )

    # آمار
    total_completed = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations
    user = relationship("UserModel", back_populates="mechanic_profile")
    specializations = relationship(
        "SpecializationModel",
        secondary=mechanic_specializations,
        backref="mechanics",
    )
    assigned_reports = relationship(
        "IssueReportModel",
        back_populates="assigned_mechanic",
        foreign_keys="IssueReportModel.assigned_mechanic_id",
    )
    reviews = relationship("ReviewModel", back_populates="mechanic")

    # ─── Property‌های جدید برای فرانت ──────────────────────────────────────
    @property
    def full_name(self) -> str:
        return self.user.full_name if self.user else ""

    @property
    def phone(self) -> str:
        return self.user.phone if self.user else None

    @property
    def email(self) -> str:
        return self.user.email if self.user else None

    @property
    def total_ratings(self) -> int:
        return len(self.reviews) if self.reviews else 0

    @property
    def specialty(self) -> str:
        if self.specializations:
            return self.specializations[0].name if self.specializations else ""
        return ""
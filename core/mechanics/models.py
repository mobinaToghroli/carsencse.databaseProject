from sqlalchemy import Column, String, Integer, Boolean, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
from specializations.models import mechanic_specializations


class MechanicModel(Base):
    __tablename__ = "mechanics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    bio = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)           # شهر محل کار
    years_of_experience = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)

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

    @property
    def full_name(self) -> str:
        return self.user.full_name if self.user else ""

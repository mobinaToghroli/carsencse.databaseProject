from sqlalchemy import Column, Integer, Float, Text, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class ReviewModel(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("issue_reports.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mechanic_id = Column(Integer, ForeignKey("mechanics.id"), nullable=False)

    rating = Column(Integer, nullable=False)  # 1 تا 5
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    report = relationship("IssueReportModel", back_populates="review")
    user = relationship("UserModel", back_populates="reviews_given")
    mechanic = relationship("MechanicModel", back_populates="reviews")

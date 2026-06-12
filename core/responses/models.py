from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class ResponseModel(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("issue_reports.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    message = Column(Text, nullable=False)

    # فقط مکانیک می‌تواند این فیلدها را پر کند
    estimated_cost = Column(Float, nullable=True)       # تومان
    estimated_duration = Column(Float, nullable=True)   # ساعت
    visit_date = Column(Date, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    report = relationship("IssueReportModel", back_populates="responses")
    sender = relationship("UserModel", back_populates="responses")

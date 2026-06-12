from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum


class AttachmentType(str, enum.Enum):
    image = "image"
    audio = "audio"


class AttachmentModel(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("issue_reports.id"), nullable=False)

    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(Enum(AttachmentType), nullable=False)
    file_size = Column(Integer, nullable=True)  # bytes

    created_at = Column(DateTime, server_default=func.now())

    report = relationship("IssueReportModel", back_populates="attachments")

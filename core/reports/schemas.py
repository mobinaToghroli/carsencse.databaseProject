from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from reports.models import IssueCategory, IssuePriority, IssueStatus


class IssueReportCreateSchema(BaseModel):
    vehicle_id: int
    title: str
    description: str
    category: IssueCategory
    priority: IssuePriority = IssuePriority.normal
    mechanic_id: Optional[int] = None  # ← اضافه شد

    @field_validator("description")
    @classmethod
    def description_min_length(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("شرح مشکل باید حداقل ۱۰ کاراکتر باشد")
        return v


class IssueReportOutSchema(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    assigned_mechanic_id: Optional[int] = None
    title: str
    description: str
    category: IssueCategory
    priority: IssuePriority
    status: IssueStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IssueStatusUpdateSchema(BaseModel):
    status: IssueStatus

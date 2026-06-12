from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class ResponseCreateSchema(BaseModel):
    message: str
    estimated_cost: Optional[float] = None
    estimated_duration: Optional[float] = None
    visit_date: Optional[date] = None


class ResponseOutSchema(BaseModel):
    id: int
    report_id: int
    sender_id: int
    message: str
    estimated_cost: Optional[float] = None
    estimated_duration: Optional[float] = None
    visit_date: Optional[date] = None
    created_at: datetime

    model_config = {"from_attributes": True}

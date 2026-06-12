from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class ReviewCreateSchema(BaseModel):
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("امتیاز باید بین ۱ تا ۵ باشد")
        return v


class ReviewOutSchema(BaseModel):
    id: int
    report_id: int
    user_id: int
    mechanic_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

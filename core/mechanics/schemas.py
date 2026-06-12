from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SpecializationOutSchema(BaseModel):
    id: int
    name: str
    slug: str
    model_config = {"from_attributes": True}


class MechanicProfileUpdateSchema(BaseModel):
    bio: Optional[str] = None
    city: Optional[str] = None
    years_of_experience: Optional[int] = None
    specialization_ids: Optional[List[int]] = None


class MechanicOutSchema(BaseModel):
    id: int
    user_id: int
    full_name: str
    bio: Optional[str] = None
    city: Optional[str] = None
    years_of_experience: int
    is_verified: bool
    total_completed: int
    average_rating: float
    specializations: List[SpecializationOutSchema] = []

    model_config = {"from_attributes": True}


class MechanicPublicSchema(BaseModel):
    """پروفایل عمومی مکانیک — قابل مشاهده برای همه"""
    id: int
    full_name: str
    bio: Optional[str] = None
    city: Optional[str] = None
    years_of_experience: int
    total_completed: int
    average_rating: float
    specializations: List[SpecializationOutSchema] = []

    model_config = {"from_attributes": True}

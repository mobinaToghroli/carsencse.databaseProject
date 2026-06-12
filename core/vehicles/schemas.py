from pydantic import BaseModel, field_validator
from typing import Optional
from vehicles.models import FuelType
from datetime import datetime


class VehicleCreateSchema(BaseModel):
    brand: str
    model: str
    year: int
    color: Optional[str] = None
    plate: Optional[str] = None
    fuel_type: FuelType = FuelType.gasoline

    @field_validator("year")
    @classmethod
    def validate_year(cls, v):
        if not 1360 <= v <= 1410:
            raise ValueError("سال تولید معتبر نیست")
        return v


class VehicleUpdateSchema(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    plate: Optional[str] = None
    fuel_type: Optional[FuelType] = None


class VehicleOutSchema(BaseModel):
    id: int
    owner_id: int
    brand: str
    model: str
    year: int
    color: Optional[str] = None
    plate: Optional[str] = None
    fuel_type: FuelType
    display_name: str
    created_at: datetime

    model_config = {"from_attributes": True}

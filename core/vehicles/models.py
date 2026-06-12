from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum


class FuelType(str, enum.Enum):
    gasoline = "gasoline"
    diesel = "diesel"
    hybrid = "hybrid"
    electric = "electric"
    cng = "cng"


class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    color = Column(String(50), nullable=True)
    plate = Column(String(20), nullable=True)
    fuel_type = Column(Enum(FuelType), default=FuelType.gasoline)

    created_at = Column(DateTime, server_default=func.now())

    # Relations
    owner = relationship("UserModel", back_populates="vehicles")
    reports = relationship("IssueReportModel", back_populates="vehicle")

    @property
    def display_name(self) -> str:
        return f"{self.brand} {self.model} {self.year}"

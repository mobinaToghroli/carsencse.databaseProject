from sqlalchemy import Column, String, Integer, Table, ForeignKey
from core.database import Base

mechanic_specializations = Table(
    "mechanic_specializations",
    Base.metadata,
    Column("mechanic_id", Integer, ForeignKey("mechanics.id"), primary_key=True),
    Column("specialization_id", Integer, ForeignKey("specializations.id"), primary_key=True),
)


class SpecializationModel(Base):
    __tablename__ = "specializations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)   # نام فارسی: موتور
    slug = Column(String(100), nullable=False, unique=True)   # engine, gearbox, ...

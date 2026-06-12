from sqlalchemy import Column, String, Boolean, Integer, DateTime, Enum
from sqlalchemy.orm import relationship
from core.database import Base
from passlib.context import CryptContext
from sqlalchemy.sql import func
import enum

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRole(str, enum.Enum):
    user = "user"
    mechanic = "mechanic"
    admin = "admin"


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, unique=True)
    phone = Column(String(20), nullable=True, unique=True)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations
    vehicles = relationship("VehicleModel", back_populates="owner", cascade="all, delete-orphan")
    reports = relationship("IssueReportModel", back_populates="user", foreign_keys="IssueReportModel.user_id")
    reviews_given = relationship("ReviewModel", back_populates="user")
    responses = relationship("ResponseModel", back_populates="sender")
    mechanic_profile = relationship("MechanicModel", back_populates="user", uselist=False)
    notifications = relationship("NotificationModel", back_populates="user", cascade="all, delete-orphan")

    def hash_password(self, plain_password):
       plain_password = plain_password[:72]
       return pwd_context.hash(plain_password)


    def verify_password(self, plain_password: str) -> bool:
        return pwd_context.verify(plain_password, self.password)

    def set_password(self, plain_text: str) -> None:
        self.password = self.hash_password(plain_text)

    @property
    def is_mechanic(self) -> bool:
        return self.role == UserRole.mechanic

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.admin

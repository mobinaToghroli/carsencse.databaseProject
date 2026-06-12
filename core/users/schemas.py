from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
from users.models import UserRole
from datetime import datetime
import re


class UserRegisterSchema(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.user

    @model_validator(mode="after")
    def email_or_phone_required(self):
        if not self.email and not self.phone:
            raise ValueError("ایمیل یا شماره موبایل الزامی است")
        return self

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r"^09\d{9}$", v):
            raise ValueError("شماره موبایل معتبر نیست (باید با 09 شروع شود و ۱۱ رقم باشد)")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("رمز عبور باید حداقل ۸ کاراکتر باشد")
        return v

    @field_validator("role")
    @classmethod
    def no_admin_self_register(cls, v):
        if v == UserRole.admin:
            raise ValueError("ثبت‌نام با نقش ادمین مجاز نیست")
        return v


class UserLoginSchema(BaseModel):
    identifier: str  # ایمیل یا موبایل
    password: str


class UserRefreshTokenSchema(BaseModel):
    token: str


class UserOutSchema(BaseModel):
    id: int
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r"^09\d{9}$", v):
            raise ValueError("شماره موبایل معتبر نیست")
        return v


class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("رمز عبور جدید باید حداقل ۸ کاراکتر باشد")
        return v

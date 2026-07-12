from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.database import get_db
from core.config import settings
from users.models import UserModel, UserRole
from users.schemas import (
    UserRegisterSchema, UserLoginSchema, UserRefreshTokenSchema,
    UserOutSchema, UserUpdateSchema, ChangePasswordSchema,
)
from mechanics.models import MechanicModel
from auth.jwt_auth import (
    generate_access_token, generate_refresh_token,
    decode_refresh_token, get_authenticated_jwt_user,
)
import os
import uuid
import shutil

router = APIRouter(prefix="/auth", tags=["Auth & Users"])


# ─── ثبت‌نام ──────────────────────────────────────────────────────────────────
@router.post("/register", status_code=201)
async def register(request: UserRegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(
        or_(
            UserModel.email == request.email if request.email else False,
            UserModel.phone == request.phone if request.phone else False,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="ایمیل یا شماره موبایل قبلاً ثبت شده است")

    user = UserModel(
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        role=request.role,
    )
    user.set_password(request.password)
    db.add(user)
    db.flush()

    if request.role == UserRole.mechanic:
        db.add(MechanicModel(user_id=user.id))

    db.commit()
    return JSONResponse(content={"detail": "ثبت‌نام با موفقیت انجام شد"}, status_code=201)


# ─── ورود ─────────────────────────────────────────────────────────────────────
@router.post("/login")
async def login(request: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(
        or_(
            UserModel.email == request.identifier,
            UserModel.phone == request.identifier,
        )
    ).first()

    if not user or not user.verify_password(request.password):
        raise HTTPException(status_code=401, detail="اطلاعات ورود نادرست است")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="حساب کاربری غیرفعال است")

    return JSONResponse(content={
        "access_token": generate_access_token(user.id),
        "refresh_token": generate_refresh_token(user.id),
        "role": user.role.value,
        "user_id": user.id,
        "full_name": user.full_name,
    })


# ─── تجدید توکن ───────────────────────────────────────────────────────────────
@router.post("/refresh")
async def refresh(request: UserRefreshTokenSchema, db: Session = Depends(get_db)):
    user_id = decode_refresh_token(request.token)
    user = db.query(UserModel).filter_by(id=user_id, is_active=True).first()
    if not user:
        raise HTTPException(status_code=401, detail="کاربر یافت نشد")
    return JSONResponse(content={"access_token": generate_access_token(user_id)})


# ─── پروفایل من ───────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOutSchema)
async def me(current_user: UserModel = Depends(get_authenticated_jwt_user)):
    return current_user


@router.patch("/me", response_model=UserOutSchema)
async def update_me(
    request: UserUpdateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    data = request.model_dump(exclude_none=True)

    # بررسی تکراری نبودن ایمیل/موبایل جدید
    if "email" in data:
        dup = db.query(UserModel).filter(UserModel.email == data["email"], UserModel.id != current_user.id).first()
        if dup:
            raise HTTPException(status_code=409, detail="این ایمیل قبلاً استفاده شده است")
    if "phone" in data:
        dup = db.query(UserModel).filter(UserModel.phone == data["phone"], UserModel.id != current_user.id).first()
        if dup:
            raise HTTPException(status_code=409, detail="این شماره موبایل قبلاً استفاده شده است")

    for field, value in data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


# ─── آپلود آواتار ────────────────────────────────────────────────────────────
@router.post("/me/upload-avatar", status_code=200)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    # ─── بررسی نوع فایل ──────────────────────────────────────────────────────
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="فرمت فایل پشتیبانی نمی‌شود. (jpg, png, webp, gif)"
        )

    # ─── بررسی حجم ──────────────────────────────────────────────────────────
    MAX_SIZE = 2 * 1024 * 1024  # 2MB
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="حجم فایل نباید بیشتر از ۲MB باشد"
        )

    # ─── ذخیره فایل ──────────────────────────────────────────────────────────
    upload_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    unique_name = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # ─── ذخیره آدرس در دیتابیس ──────────────────────────────────────────────
    avatar_url = f"/uploads/avatars/{unique_name}"
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return JSONResponse(content={
        "detail": "آواتار با موفقیت آپلود شد",
        "avatar_url": avatar_url
    })


# ─── تغییر رمز عبور ───────────────────────────────────────────────────────────
@router.post("/me/change-password")
async def change_password(
    request: ChangePasswordSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    if not current_user.verify_password(request.old_password):
        raise HTTPException(status_code=400, detail="رمز عبور فعلی اشتباه است")
    current_user.set_password(request.new_password)
    db.commit()
    return JSONResponse(content={"detail": "رمز عبور با موفقیت تغییر کرد"})
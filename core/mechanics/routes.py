from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.database import get_db
from auth.jwt_auth import get_authenticated_jwt_user, require_mechanic
from users.models import UserModel
from mechanics.models import MechanicModel
from mechanics.schemas import MechanicProfileUpdateSchema, MechanicOutSchema, MechanicPublicSchema
from specializations.models import SpecializationModel
from typing import List, Optional

router = APIRouter(prefix="/mechanics", tags=["Mechanics"])


# ─── صفحه کلی مکانیک‌های موجود (عمومی) ──────────────────────────────────────
@router.get("/", response_model=List[MechanicPublicSchema])
async def list_mechanics(
    city: Optional[str] = Query(None, description="فیلتر بر اساس شهر"),
    specialization: Optional[str] = Query(None, description="slug تخصص (مثلاً engine)"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="حداقل امتیاز"),
    db: Session = Depends(get_db),
):
    query = db.query(MechanicModel).filter_by(is_verified=True)

    if city:
        query = query.filter(MechanicModel.city.ilike(f"%{city}%"))

    if specialization:
        query = query.filter(
            MechanicModel.specializations.any(SpecializationModel.slug == specialization)
        )

    if min_rating is not None:
        query = query.filter(MechanicModel.average_rating >= min_rating)

    return query.order_by(MechanicModel.average_rating.desc()).all()


# ─── پروفایل عمومی یک مکانیک ──────────────────────────────────────────────────
@router.get("/{mechanic_id}", response_model=MechanicPublicSchema)
async def get_mechanic_public(mechanic_id: int, db: Session = Depends(get_db)):
    mechanic = db.query(MechanicModel).filter_by(id=mechanic_id, is_verified=True).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="مکانیک یافت نشد")
    return mechanic


# ─── پنل مکانیک: پروفایل خودم ──────────────────────────────────────────────
@router.get("/me/profile", response_model=MechanicOutSchema)
async def my_mechanic_profile(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_mechanic),
):
    mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="پروفایل مکانیک یافت نشد")
    return mechanic


@router.patch("/me/profile", response_model=MechanicOutSchema)
async def update_mechanic_profile(
    request: MechanicProfileUpdateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_mechanic),
):
    mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()

    if request.bio is not None:
        mechanic.bio = request.bio
    if request.city is not None:
        mechanic.city = request.city
    if request.years_of_experience is not None:
        mechanic.years_of_experience = request.years_of_experience
    if request.specialization_ids is not None:
        specs = db.query(SpecializationModel).filter(
            SpecializationModel.id.in_(request.specialization_ids)
        ).all()
        mechanic.specializations = specs

    db.commit()
    db.refresh(mechanic)
    return mechanic

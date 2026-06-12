from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from auth.jwt_auth import get_authenticated_jwt_user
from users.models import UserModel
from vehicles.models import VehicleModel
from vehicles.schemas import VehicleCreateSchema, VehicleOutSchema, VehicleUpdateSchema
from typing import List

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("/", response_model=List[VehicleOutSchema])
async def my_vehicles(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    return db.query(VehicleModel).filter_by(owner_id=current_user.id).all()


@router.post("/", response_model=VehicleOutSchema, status_code=201)
async def add_vehicle(
    request: VehicleCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    vehicle = VehicleModel(owner_id=current_user.id, **request.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleOutSchema)
async def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    vehicle = db.query(VehicleModel).filter_by(id=vehicle_id, owner_id=current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="خودرو یافت نشد")
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleOutSchema)
async def update_vehicle(
    vehicle_id: int,
    request: VehicleUpdateSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    vehicle = db.query(VehicleModel).filter_by(id=vehicle_id, owner_id=current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="خودرو یافت نشد")
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=204)
async def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    vehicle = db.query(VehicleModel).filter_by(id=vehicle_id, owner_id=current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="خودرو یافت نشد")
    db.delete(vehicle)
    db.commit()

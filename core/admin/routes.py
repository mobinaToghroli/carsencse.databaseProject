from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from auth.jwt_auth import require_admin
from users.models import UserModel
from mechanics.models import MechanicModel
from reports.models import IssueReportModel
from specializations.models import SpecializationModel
from mechanics.schemas import MechanicOutSchema
from reports.schemas import IssueReportOutSchema
from users.schemas import UserOutSchema
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])


class SpecializationCreateSchema(BaseModel):
    name: str
    slug: str


# ─── مدیریت مکانیک‌ها ────────────────────────────────────────────────────────
@router.get("/mechanics/pending", response_model=List[MechanicOutSchema])
async def pending_mechanics(
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    return db.query(MechanicModel).filter_by(is_verified=False).all()


@router.post("/mechanics/{mechanic_id}/verify")
async def verify_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    mechanic = db.query(MechanicModel).filter_by(id=mechanic_id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="مکانیک یافت نشد")
    mechanic.is_verified = True
    db.commit()
    return JSONResponse(content={"detail": "مکانیک تأیید شد"})


@router.post("/mechanics/{mechanic_id}/revoke")
async def revoke_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    mechanic = db.query(MechanicModel).filter_by(id=mechanic_id).first()
    if not mechanic:
        raise HTTPException(status_code=404, detail="مکانیک یافت نشد")
    mechanic.is_verified = False
    db.commit()
    return JSONResponse(content={"detail": "تأیید مکانیک لغو شد"})


# ─── مدیریت کاربران ──────────────────────────────────────────────────────────
@router.get("/users", response_model=List[UserOutSchema])
async def list_users(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    query = db.query(UserModel)
    if role:
        query = query.filter(UserModel.role == role)
    return query.order_by(UserModel.created_at.desc()).all()


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    user = db.query(UserModel).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    user.is_active = False
    db.commit()
    return JSONResponse(content={"detail": "کاربر غیرفعال شد"})


# ─── مدیریت درخواست‌ها ───────────────────────────────────────────────────────
@router.get("/reports", response_model=List[IssueReportOutSchema])
async def all_reports(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    query = db.query(IssueReportModel)
    if status:
        query = query.filter(IssueReportModel.status == status)
    return query.order_by(IssueReportModel.created_at.desc()).all()


# ─── آمار داشبورد ─────────────────────────────────────────────────────────────
@router.get("/stats")
async def dashboard_stats(
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    return {
        "total_users": db.query(UserModel).filter_by(role="user").count(),
        "total_mechanics": db.query(MechanicModel).count(),
        "verified_mechanics": db.query(MechanicModel).filter_by(is_verified=True).count(),
        "pending_mechanics": db.query(MechanicModel).filter_by(is_verified=False).count(),
        "total_reports": db.query(IssueReportModel).count(),
        "pending_reports": db.query(IssueReportModel).filter_by(status="pending").count(),
        "completed_reports": db.query(IssueReportModel).filter_by(status="completed").count(),
    }


# ─── مدیریت تخصص‌ها ──────────────────────────────────────────────────────────
@router.get("/specializations")
async def list_specializations(db: Session = Depends(get_db)):
    return db.query(SpecializationModel).all()


@router.post("/specializations", status_code=201)
async def create_specialization(
    request: SpecializationCreateSchema,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    existing = db.query(SpecializationModel).filter_by(slug=request.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="این تخصص قبلاً ثبت شده است")
    spec = SpecializationModel(name=request.name, slug=request.slug)
    db.add(spec)
    db.commit()
    return JSONResponse(content={"detail": "تخصص اضافه شد"}, status_code=201)


@router.delete("/specializations/{spec_id}", status_code=204)
async def delete_specialization(
    spec_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    spec = db.query(SpecializationModel).filter_by(id=spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="تخصص یافت نشد")
    db.delete(spec)
    db.commit()

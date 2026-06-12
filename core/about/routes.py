from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from auth.jwt_auth import require_admin
from about.models import SiteContentModel
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/about", tags=["About & Footer"])


class SiteContentOutSchema(BaseModel):
    key: str
    title: Optional[str] = None
    body: str
    model_config = {"from_attributes": True}


class SiteContentUpdateSchema(BaseModel):
    title: Optional[str] = None
    body: str


# ─── عمومی: خواندن محتوا ─────────────────────────────────────────────────────
@router.get("/{key}", response_model=SiteContentOutSchema)
async def get_content(key: str, db: Session = Depends(get_db)):
    content = db.query(SiteContentModel).filter_by(key=key).first()
    if not content:
        raise HTTPException(status_code=404, detail="محتوا یافت نشد")
    return content


@router.get("/", response_model=list[SiteContentOutSchema])
async def list_contents(db: Session = Depends(get_db)):
    return db.query(SiteContentModel).all()


# ─── ادمین: ویرایش محتوا ─────────────────────────────────────────────────────
@router.put("/{key}", response_model=SiteContentOutSchema)
async def upsert_content(
    key: str,
    request: SiteContentUpdateSchema,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    content = db.query(SiteContentModel).filter_by(key=key).first()
    if content:
        content.title = request.title
        content.body = request.body
    else:
        content = SiteContentModel(key=key, title=request.title, body=request.body)
        db.add(content)
    db.commit()
    db.refresh(content)
    return content

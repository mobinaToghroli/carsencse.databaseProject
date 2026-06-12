from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from core.database import get_db
from core.config import settings
from auth.jwt_auth import get_authenticated_jwt_user
from users.models import UserModel
from reports.models import IssueReportModel
from attachments.models import AttachmentModel, AttachmentType
import os, uuid, shutil

router = APIRouter(prefix="/reports/{report_id}/attachments", tags=["Attachments"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4", "audio/webm"}


def _check_report_ownership(report_id: int, current_user: UserModel, db: Session) -> IssueReportModel:
    report = db.query(IssueReportModel).filter_by(id=report_id, user_id=current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد یا متعلق به شما نیست")
    return report


@router.post("/", status_code=201)
async def upload_attachment(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    report = _check_report_ownership(report_id, current_user, db)

    # تشخیص نوع فایل
    if file.content_type in ALLOWED_IMAGE_TYPES:
        file_type = AttachmentType.image
        max_size_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        max_count = settings.MAX_IMAGES_PER_REPORT
    elif file.content_type in ALLOWED_AUDIO_TYPES:
        file_type = AttachmentType.audio
        max_size_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
        max_count = settings.MAX_AUDIOS_PER_REPORT
    else:
        raise HTTPException(status_code=400, detail="فرمت فایل پشتیبانی نمی‌شود. تصویر (jpg/png/webp) یا صدا (mp3/ogg/wav) ارسال کنید")

    # بررسی تعداد
    existing_count = db.query(AttachmentModel).filter_by(
        report_id=report_id, file_type=file_type
    ).count()
    if existing_count >= max_count:
        raise HTTPException(
            status_code=400,
            detail=f"حداکثر {max_count} فایل از این نوع مجاز است"
        )

    # ذخیره فایل
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(report_id))
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    unique_name = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size = os.path.getsize(file_path)
    if file_size > max_size_bytes:
        os.remove(file_path)
        limit = settings.MAX_IMAGE_SIZE_MB if file_type == AttachmentType.image else settings.MAX_AUDIO_SIZE_MB
        raise HTTPException(status_code=400, detail=f"حجم فایل بیشتر از {limit}MB است")

    attachment = AttachmentModel(
        report_id=report_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return JSONResponse(content={
        "id": attachment.id,
        "file_name": attachment.file_name,
        "file_type": attachment.file_type.value,
        "file_size": attachment.file_size,
    }, status_code=201)


@router.get("/")
async def list_attachments(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    # دسترسی: کاربر صاحب report یا مکانیک assigned
    report = db.query(IssueReportModel).filter_by(id=report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد")

    if not current_user.is_admin:
        if current_user.is_mechanic:
            from mechanics.models import MechanicModel
            mechanic = db.query(MechanicModel).filter_by(user_id=current_user.id).first()
            if report.assigned_mechanic_id != (mechanic.id if mechanic else None):
                raise HTTPException(status_code=403, detail="دسترسی ندارید")
        elif report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="دسترسی ندارید")

    attachments = db.query(AttachmentModel).filter_by(report_id=report_id).all()
    return [{"id": a.id, "file_name": a.file_name, "file_type": a.file_type.value,
             "file_size": a.file_size, "created_at": str(a.created_at)} for a in attachments]


@router.delete("/{attachment_id}", status_code=204)
async def delete_attachment(
    report_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_authenticated_jwt_user),
):
    _check_report_ownership(report_id, current_user, db)
    attachment = db.query(AttachmentModel).filter_by(id=attachment_id, report_id=report_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="فایل یافت نشد")

    if os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)

    db.delete(attachment)
    db.commit()

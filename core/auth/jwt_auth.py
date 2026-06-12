from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from core.config import settings
from core.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jwt.exceptions import DecodeError, InvalidSignatureError, ExpiredSignatureError
import jwt

security = HTTPBearer(auto_error=False)


def generate_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "type": "access",
        "user_id": user_id,
        "iat": now,
        "exp": now + timedelta(seconds=settings.JWT_ACCESS_EXPIRE_SECONDS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def generate_refresh_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "type": "refresh",
        "user_id": user_id,
        "iat": now,
        "exp": now + timedelta(seconds=settings.JWT_REFRESH_EXPIRE_SECONDS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def _decode_token(token: str, expected_type: str) -> int:
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن نامعتبر است")
        if decoded.get("type") != expected_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="نوع توکن اشتباه است")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن منقضی شده است")
    except InvalidSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="امضای توکن نامعتبر است")
    except DecodeError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="خطا در پردازش توکن")


def decode_refresh_token(token: str) -> int:
    return _decode_token(token, "refresh")


def get_authenticated_jwt_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    from users.models import UserModel

    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توکن ارسال نشده است")

    user_id = _decode_token(credentials.credentials, "access")
    user = db.query(UserModel).filter_by(id=user_id, is_active=True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="کاربر یافت نشد یا غیرفعال است")
    return user


def require_mechanic(current_user=Depends(get_authenticated_jwt_user)):
    if not current_user.is_mechanic:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="فقط مکانیک‌ها دسترسی دارند")
    return current_user


def require_admin(current_user=Depends(get_authenticated_jwt_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="فقط ادمین دسترسی دارد")
    return current_user

from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.sql import func
from core.database import Base


class SiteContentModel(Base):
    """محتوای استاتیک سایت — فوتر، درباره ما، تماس با ما"""
    __tablename__ = "site_content"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(100), unique=True, nullable=False)   # about_us, footer_text, contact_info
    title = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

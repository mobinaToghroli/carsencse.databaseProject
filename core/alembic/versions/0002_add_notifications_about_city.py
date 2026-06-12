"""full schema v2

Revision ID: 0002
Revises: 0001
Create Date: 2025-06-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ─── جدول notifications ────────────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("report_id", sa.Integer, sa.ForeignKey("issue_reports.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("is_read", sa.Boolean, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    # ─── جدول site_content (درباره ما، فوتر) ──────────────────────────────────
    op.create_table(
        "site_content",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # ─── ستون city به جدول mechanics ──────────────────────────────────────────
    op.add_column("mechanics", sa.Column("city", sa.String(100), nullable=True))

    # ─── seed: محتوای پیش‌فرض درباره ما ──────────────────────────────────────
    op.execute("""
        INSERT INTO site_content (key, title, body) VALUES
        ('about_us', 'درباره ما', 'پلتفرم مکانیک — راه‌حلی سریع و مطمئن برای مشکلات خودروی شما'),
        ('footer_text', 'فوتر', 'تمام حقوق برای پلتفرم مکانیک محفوظ است')
    """)

    # ─── seed: تخصص‌های پیش‌فرض ───────────────────────────────────────────────
    op.execute("""
        INSERT INTO specializations (name, slug) VALUES
        ('موتور', 'engine'),
        ('گیربکس', 'gearbox'),
        ('برق خودرو', 'electrical'),
        ('ترمز', 'brakes'),
        ('سیستم خنک‌کننده', 'cooling'),
        ('فرمان', 'steering'),
        ('بدنه', 'body'),
        ('سیستم تعلیق', 'suspension'),
        ('اگزوز', 'exhaust'),
        ('سایر', 'other')
        ON CONFLICT (slug) DO NOTHING
    """)


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("site_content")
    op.drop_column("mechanics", "city")

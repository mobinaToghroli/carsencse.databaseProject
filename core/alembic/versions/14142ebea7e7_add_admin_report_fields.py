"""add_admin_report_fields

Revision ID: 14142ebea7e7
Revises: 0002
Create Date: 2026-07-11
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

revision = "14142ebea7e7"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ─── ایجاد Enum برای admin_status ──────────────────────────────────────
    admin_status_enum = ENUM(
        "pending", "approved", "rejected",
        name="adminstatus",
        create_type=True
    )
    admin_status_enum.create(op.get_bind(), checkfirst=True)

    # ─── اضافه کردن فیلدها به issue_reports ──────────────────────────────
    op.add_column("issue_reports", sa.Column(
        "admin_status",
        admin_status_enum,
        server_default="pending",
        nullable=True
    ))
    op.add_column("issue_reports", sa.Column("tracking_code", sa.String(50), unique=True, nullable=True))
    op.add_column("issue_reports", sa.Column("cost", sa.Float, nullable=True))
    op.add_column("issue_reports", sa.Column("mechanic_notes", sa.Text, nullable=True))

    # ─── اضافه کردن فیلدهای جدید به mechanics ─────────────────────────────
    op.add_column("mechanics", sa.Column("workshop_name", sa.String(200), nullable=True))
    op.add_column("mechanics", sa.Column("address", sa.String(300), nullable=True))
    op.add_column("mechanics", sa.Column("national_id", sa.String(20), nullable=True))
    
    # ─── اضافه کردن approval_status به mechanics ──────────────────────────
    approval_enum = ENUM(
        "pending", "approved", "rejected",
        name="mechanicapprovalstatus",
        create_type=True
    )
    approval_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "mechanics",
        sa.Column(
            "approval_status",
            approval_enum,
            server_default="pending",
            nullable=True
        )
    )


def downgrade() -> None:
    op.drop_column("mechanics", "approval_status")
    op.drop_column("mechanics", "national_id")
    op.drop_column("mechanics", "address")
    op.drop_column("mechanics", "workshop_name")
    
    op.drop_column("issue_reports", "mechanic_notes")
    op.drop_column("issue_reports", "cost")
    op.drop_column("issue_reports", "tracking_code")
    op.drop_column("issue_reports", "admin_status")
    
    op.execute("DROP TYPE IF EXISTS adminstatus")
    op.execute("DROP TYPE IF EXISTS mechanicapprovalstatus")

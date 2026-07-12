"""add_avatar_url_to_users

Revision ID: 7688172f7369
Revises: 14142ebea7e7
Create Date: 2026-07-11
"""
from alembic import op
import sqlalchemy as sa


revision = "7688172f7369"
down_revision = "14142ebea7e7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar_url")

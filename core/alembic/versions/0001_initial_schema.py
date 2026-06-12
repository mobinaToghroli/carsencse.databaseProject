"""initial schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=True),
        sa.Column("phone", sa.String(20), unique=True, nullable=True),
        sa.Column("password", sa.String, nullable=False),
        sa.Column("role", sa.Enum("user", "mechanic", "admin", name="userrole"), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # specializations
    op.create_table(
        "specializations",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
    )

    # mechanics
    op.create_table(
        "mechanics",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), unique=True, nullable=False),
        sa.Column("bio", sa.Text, nullable=True),
        sa.Column("years_of_experience", sa.Integer, server_default="0"),
        sa.Column("is_verified", sa.Boolean, server_default=sa.text("false")),
        sa.Column("total_completed", sa.Integer, server_default="0"),
        sa.Column("average_rating", sa.Float, server_default="0.0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # mechanic_specializations (many-to-many)
    op.create_table(
        "mechanic_specializations",
        sa.Column("mechanic_id", sa.Integer, sa.ForeignKey("mechanics.id"), primary_key=True),
        sa.Column("specialization_id", sa.Integer, sa.ForeignKey("specializations.id"), primary_key=True),
    )

    # vehicles
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("owner_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("brand", sa.String(100), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("year", sa.Integer, nullable=False),
        sa.Column("color", sa.String(50), nullable=True),
        sa.Column("plate", sa.String(20), nullable=True),
        sa.Column("fuel_type", sa.Enum("gasoline", "diesel", "hybrid", "electric", "cng", name="fueltype"), server_default="gasoline"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # issue_reports
    op.create_table(
        "issue_reports",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("vehicle_id", sa.Integer, sa.ForeignKey("vehicles.id"), nullable=False),
        sa.Column("assigned_mechanic_id", sa.Integer, sa.ForeignKey("mechanics.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("category", sa.Enum("engine","gearbox","electrical","brakes","cooling","steering","body","suspension","exhaust","other", name="issuecategory"), nullable=False),
        sa.Column("priority", sa.Enum("normal","urgent","emergency", name="issuepriority"), server_default="normal"),
        sa.Column("status", sa.Enum("pending","assigned","diagnosing","waiting_for_visit","completed","cancelled", name="issuestatus"), server_default="pending"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # attachments
    op.create_table(
        "attachments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("report_id", sa.Integer, sa.ForeignKey("issue_reports.id"), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("file_type", sa.Enum("image", "audio", name="attachmenttype"), nullable=False),
        sa.Column("file_size", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # responses
    op.create_table(
        "responses",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("report_id", sa.Integer, sa.ForeignKey("issue_reports.id"), nullable=False),
        sa.Column("sender_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("estimated_cost", sa.Float, nullable=True),
        sa.Column("estimated_duration", sa.Float, nullable=True),
        sa.Column("visit_date", sa.Date, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # reviews
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("report_id", sa.Integer, sa.ForeignKey("issue_reports.id"), unique=True, nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("mechanic_id", sa.Integer, sa.ForeignKey("mechanics.id"), nullable=False),
        sa.Column("rating", sa.Integer, nullable=False),
        sa.Column("comment", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_table("responses")
    op.drop_table("attachments")
    op.drop_table("issue_reports")
    op.drop_table("vehicles")
    op.drop_table("mechanic_specializations")
    op.drop_table("mechanics")
    op.drop_table("specializations")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS fueltype")
    op.execute("DROP TYPE IF EXISTS issuecategory")
    op.execute("DROP TYPE IF EXISTS issuepriority")
    op.execute("DROP TYPE IF EXISTS issuestatus")
    op.execute("DROP TYPE IF EXISTS attachmenttype")


"""add processing job retry metadata

Revision ID: e6c3a7619e5f
Revises: c2e44264211a
Create Date: 2026-05-15 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "e6c3a7619e5f"
down_revision = "c2e44264211a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("processing_jobs", sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("processing_jobs", sa.Column("last_failed_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("processing_jobs", "last_failed_at")
    op.drop_column("processing_jobs", "attempts")

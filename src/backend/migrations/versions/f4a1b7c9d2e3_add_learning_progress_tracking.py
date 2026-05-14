"""add learning progress tracking

Revision ID: f4a1b7c9d2e3
Revises: e6c3a7619e5f
Create Date: 2026-05-15 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "f4a1b7c9d2e3"
down_revision = "e6c3a7619e5f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user_progress", sa.Column("watched_seconds", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("user_progress", sa.Column("last_position_seconds", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("user_progress", sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("user_flashcard_progress", sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("user_flashcard_progress", sa.Column("correct_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("user_flashcard_progress", sa.Column("incorrect_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("user_flashcard_progress", sa.Column("status", sa.String(), nullable=False, server_default="new"))


def downgrade() -> None:
    op.drop_column("user_flashcard_progress", "status")
    op.drop_column("user_flashcard_progress", "incorrect_count")
    op.drop_column("user_flashcard_progress", "correct_count")
    op.drop_column("user_flashcard_progress", "review_count")
    op.drop_column("user_progress", "duration_seconds")
    op.drop_column("user_progress", "last_position_seconds")
    op.drop_column("user_progress", "watched_seconds")

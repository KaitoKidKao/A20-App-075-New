"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-05-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=True)

    op.create_table(
        "video",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("storage_path", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_video_user_id", "video", ["user_id"], unique=False)

    op.create_table(
        "lecturedata",
        sa.Column("video_id", sa.String(), nullable=False),
        sa.Column("transcript", sa.JSON(), nullable=True),
        sa.Column("summary", sa.JSON(), nullable=True),
        sa.Column("timeline", sa.JSON(), nullable=True),
        sa.Column("highlights", sa.JSON(), nullable=True),
        sa.Column("questions", sa.JSON(), nullable=True),
        sa.Column("briefing", sa.JSON(), nullable=True),
        sa.Column("visual_data", sa.JSON(), nullable=True),
        sa.Column("cover_image_url", sa.String(), nullable=True),
        sa.Column("handsign_data", sa.JSON(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["video_id"], ["video.id"]),
        sa.PrimaryKeyConstraint("video_id"),
    )

    op.create_table(
        "flashcard",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("video_id", sa.String(), nullable=False),
        sa.Column("front", sa.String(), nullable=False),
        sa.Column("back", sa.String(), nullable=False),
        sa.Column("hint", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["video_id"], ["video.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_flashcard_video_id", "flashcard", ["video_id"], unique=False)

    op.create_table(
        "processingjob",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("video_id", sa.String(), nullable=False),
        sa.Column("job_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False),
        sa.Column("error_message", sa.String(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["video_id"], ["video.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_processingjob_video_id", "processingjob", ["video_id"], unique=False)
    op.create_index("ix_processingjob_job_type", "processingjob", ["job_type"], unique=False)
    op.create_index("ix_processingjob_status", "processingjob", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_processingjob_status", table_name="processingjob")
    op.drop_index("ix_processingjob_job_type", table_name="processingjob")
    op.drop_index("ix_processingjob_video_id", table_name="processingjob")
    op.drop_table("processingjob")
    op.drop_index("ix_flashcard_video_id", table_name="flashcard")
    op.drop_table("flashcard")
    op.drop_table("lecturedata")
    op.drop_index("ix_video_user_id", table_name="video")
    op.drop_table("video")
    op.drop_index("ix_user_email", table_name="user")
    op.drop_table("user")

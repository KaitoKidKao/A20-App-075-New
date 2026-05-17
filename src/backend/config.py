import os
import secrets
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_KEY_BACKUP_1 = os.getenv("OPENAI_API_KEY_BACKUP_1", "")
OPENAI_API_KEY_BACKUP_2 = os.getenv("OPENAI_API_KEY_BACKUP_2", "")
OPENAI_IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1.5")
OPENAI_IMAGE_QUALITY = os.getenv("OPENAI_IMAGE_QUALITY", "low")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")
REPLICATE_API_TOKEN_BACKUP_1 = os.getenv("REPLICATE_API_TOKEN_BACKUP_1", "")
REPLICATE_API_TOKEN_BACKUP_2 = os.getenv("REPLICATE_API_TOKEN_BACKUP_2", "")
REPLICATE_IMAGE_MODEL = os.getenv("REPLICATE_IMAGE_MODEL", "black-forest-labs/flux-1.1-pro")

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
JSON_LOGS = os.getenv("JSON_LOGS", "false").lower() == "true"
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4o-mini")
UPLOADS_DIR = "data/uploads"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
REDIS_URL = os.getenv("REDIS_URL", "").strip()
# --- Auth ---
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("ENV", "development")).lower()
SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
if not SECRET_KEY:
    if ENVIRONMENT in {"production", "prod"}:
        raise RuntimeError("SECRET_KEY is required in production.")
    # Dev fallback is generated per process (not hardcoded)
    SECRET_KEY = secrets.token_urlsafe(64)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "500"))
MAX_VIDEO_DURATION_SECONDS = int(os.getenv("MAX_VIDEO_DURATION_SECONDS", "14400"))
ALLOWED_VIDEO_EXTENSIONS = {
    ext.strip().lower()
    for ext in os.getenv("ALLOWED_VIDEO_EXTENSIONS", ".mp4,.mov,.avi,.mkv").split(",")
    if ext.strip()
}
ALLOWED_VIDEO_MIME_TYPES = {
    mime.strip().lower()
    for mime in os.getenv(
        "ALLOWED_VIDEO_MIME_TYPES",
        "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska",
    ).split(",")
    if mime.strip()
}
AUTH_COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "access_token")
AUTH_COOKIE_SECURE = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax")
LOGIN_RATE_LIMIT = os.getenv("LOGIN_RATE_LIMIT", "10/minute")
UPLOAD_RATE_LIMIT = os.getenv("UPLOAD_RATE_LIMIT", "20/hour")
AVATAR_RATE_LIMIT = os.getenv("AVATAR_RATE_LIMIT", "10/hour")
ALLOW_PUBLIC_ROLE_REGISTRATION = os.getenv("ALLOW_PUBLIC_ROLE_REGISTRATION", "false").lower() == "true"


def _parse_cors_origins(raw: str) -> list[str]:
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


_default_dev_origins = "http://localhost:3000,http://127.0.0.1:3000"
CORS_ALLOW_ORIGINS = _parse_cors_origins(os.getenv("CORS_ALLOW_ORIGINS", _default_dev_origins))
if ENVIRONMENT in {"production", "prod"} and not CORS_ALLOW_ORIGINS:
    raise RuntimeError("CORS_ALLOW_ORIGINS must be set in production.")

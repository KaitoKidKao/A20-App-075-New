import os
import secrets
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4o-mini")
UPLOADS_DIR = "data/uploads"
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


def _parse_cors_origins(raw: str) -> list[str]:
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


_default_dev_origins = "http://localhost:3000,http://127.0.0.1:3000"
CORS_ALLOW_ORIGINS = _parse_cors_origins(os.getenv("CORS_ALLOW_ORIGINS", _default_dev_origins))
if ENVIRONMENT in {"production", "prod"} and not CORS_ALLOW_ORIGINS:
    raise RuntimeError("CORS_ALLOW_ORIGINS must be set in production.")

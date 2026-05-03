import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-5-nano")
UPLOADS_DIR = "data/uploads"
# --- Auth ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

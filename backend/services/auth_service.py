import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
# ── Config ────────────────────────────────────────────────────
SECRET_KEY      = os.getenv("SECRET_KEY", "kelana-ai-secret-key-change-in-prod")
ALGORITHM       = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 jam

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password helpers ──────────────────────────────────────────
def hash_password(plain: str) -> str:
    # Bcrypt has a 72-byte limit, so we truncate before encoding
    password_bytes = plain.encode("utf-8")[:72]
    return pwd_context.hash(password_bytes)


def verify_password(plain: str, hashed: str) -> bool:
    # Bcrypt has a 72-byte limit, so we truncate before encoding
    password_bytes = plain.encode("utf-8")[:72]
    return pwd_context.verify(password_bytes, hashed)


# ── JWT helpers ───────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from .config import settings

def hash_pw(raw: str) -> str:
    return bcrypt.hashpw(raw.encode(), bcrypt.gensalt()).decode()

def check_pw(raw: str, hashed: str) -> bool:
    return bcrypt.checkpw(raw.encode(), hashed.encode())

def make_token(uid: int) -> str:
    payload = {"sub": str(uid), "exp": datetime.now(timezone.utc) + timedelta(seconds=settings.jwt_ttl)}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
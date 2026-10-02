from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from ..config import settings
from ..database import get_session
from ..models import User
import jwt

bearer = HTTPBearer(auto_error=False)

async def current_user(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_session),
) -> User:
    if not cred:
        raise HTTPException(401, "Not authenticated")
    try:
        uid = int(jwt.decode(cred.credentials, settings.jwt_secret, algorithms=["HS256"])["sub"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    user = await db.get(User, uid)
    if not user:
        raise HTTPException(401, "Unknown user")
    return user
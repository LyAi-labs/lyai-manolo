import datetime

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User

bearer = HTTPBearer(auto_error=True)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


def create_token(sub: int) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.JWT_EXPIRE_MIN)
    return jwt.encode({"sub": str(sub), "exp": exp}, settings.JWT_SECRET, algorithm="HS256")


def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(cred.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        uid = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.get(User, uid)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no existe")
    return user

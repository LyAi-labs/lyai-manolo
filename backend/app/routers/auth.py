from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import LoginIn, TokenOut, UserOut, LangIn
from ..auth import verify_password, create_token, get_current_user

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    ident = data.identifier.strip()
    user = (
        db.query(User)
        .filter((User.email == ident.lower()) | (User.username == ident))
        .first()
    )
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"access_token": create_token(user.id), "token_type": "bearer", "user": user}


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me/lang", response_model=UserOut)
def set_lang(data: LangIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.lang not in ("es", "fr"):
        raise HTTPException(status_code=400, detail="Idioma no soportado")
    user.lang = data.lang
    db.commit()
    db.refresh(user)
    return user

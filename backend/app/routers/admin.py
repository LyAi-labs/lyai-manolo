import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, User, Lesson
from ..auth import get_current_user, hash_password
from ..schemas import UserOut, StudentCreate, StudentCreated
from ..config import settings

router = APIRouter(tags=["admin"])


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Solo el profesor puede acceder")
    return user


@router.get("/admin/today")
def today(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = (
        db.query(Booking)
        .filter(Booking.date == settings.DEMO_TODAY)
        .order_by(Booking.time)
        .all()
    )
    out = [
        {
            "time": b.time,
            "student": b.user.name if b.user else None,
            "type": f"{b.class_type.name} {b.level or ''}".strip(),
            "status": b.payment_status,
        }
        for b in rows
    ]
    out.append({"time": "19:00", "student": None, "type": "Libre", "status": "free"})
    return out


@router.get("/admin/stats")
def stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "students": db.query(User).filter(User.role == "student").count(),
        "classesWeek": db.query(Booking).count(),
        "materials": db.query(Lesson).count(),
    }


@router.get("/admin/students", response_model=list[UserOut])
def list_students(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "student").order_by(User.name).all()


@router.post("/admin/students", response_model=StudentCreated)
def create_student(
    data: StudentCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email = data.email.strip().lower()
    if not email or not data.name.strip():
        raise HTTPException(status_code=400, detail="Nombre y email son obligatorios")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese email")

    temp_password = (data.password or "").strip() or secrets.token_urlsafe(6)
    student = User(
        email=email,
        name=data.name.strip(),
        role="student",
        level=(data.level or "A1"),
        hashed_password=hash_password(temp_password),
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"student": student, "temp_password": temp_password}

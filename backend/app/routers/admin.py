from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, User, Lesson
from ..auth import get_current_user
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

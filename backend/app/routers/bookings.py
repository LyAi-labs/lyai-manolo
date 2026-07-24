from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, ClassType, User
from ..schemas import BookingOut, BookingIn
from ..auth import get_current_user
from .. import tg

router = APIRouter(tags=["bookings"])


def _serialize(b: Booking) -> dict:
    return {
        "id": b.id,
        "type": b.class_type.name if b.class_type else "",
        "level": b.level or "",
        "when": b.when_label or f"{b.date} · {b.time}",
        "payment": b.payment_status,
        "status": b.status,
        "room": b.room,
    }


@router.get("/bookings", response_model=list[BookingOut])
def my_bookings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Booking).filter(Booking.user_id == user.id).all()
    return [_serialize(b) for b in rows]


@router.post("/bookings", response_model=BookingOut)
def create_booking(
    data: BookingIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ct = db.get(ClassType, data.class_type_id)
    if not ct:
        raise HTTPException(status_code=404, detail="Tipo de clase no existe")
    b = Booking(
        user_id=user.id,
        class_type_id=ct.id,
        date=data.date,
        time=data.time,
        level=user.level,
        status="pending",  # nace pendiente → la confirma Manolo (panel o Telegram)
        payment_status="pending",
        room=f"AulaFrancesManolo-{user.id}-{data.date}-{data.time}",
        when_label=f"{data.date} · {data.time}",
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    # Aviso a Manolo con botones Confirmar/Rechazar (no debe romper la reserva).
    try:
        tg.notify_new_booking(b, user.name)
    except Exception:
        pass
    return _serialize(b)

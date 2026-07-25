import json
import calendar as _cal
from datetime import datetime, timedelta, date as date_cls
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ClassType, Availability, Lesson, Vocab, LessonProgress, User, ClassReport, Booking
from ..schemas import ClassTypeOut, LessonOut
from ..curriculum import audio_slug
from ..auth import get_current_user
from ..config import settings

router = APIRouter(tags=["catalog"])


@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db.get(Lesson, lesson_id):
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    exists = db.query(LessonProgress).filter_by(user_id=user.id, lesson_id=lesson_id).first()
    if not exists:
        db.add(LessonProgress(user_id=user.id, lesson_id=lesson_id, completed_at=datetime.utcnow().isoformat()))
        db.commit()
    return {"ok": True}


@router.get("/me/progress")
def my_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ids = [p.lesson_id for p in db.query(LessonProgress).filter_by(user_id=user.id).all()]
    return {"completed": ids, "count": len(ids)}


@router.get("/me/progress/weekly")
def weekly_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lecciones completadas por día en los últimos 7 días (desde completed_at)."""
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    counts = {d.isoformat(): 0 for d in days}
    for p in db.query(LessonProgress).filter_by(user_id=user.id).all():
        if p.completed_at and p.completed_at[:10] in counts:
            counts[p.completed_at[:10]] += 1
    # dow al estilo JS getDay(): domingo=0 … sábado=6
    return {"days": [{"date": d.isoformat(), "dow": (d.weekday() + 1) % 7, "count": counts[d.isoformat()]} for d in days]}


@router.get("/me/homework")
def my_homework(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rep = (
        db.query(ClassReport)
        .filter_by(student_id=user.id)
        .order_by(ClassReport.id.desc())
        .first()
    )
    if not rep:
        return {"has": False}
    return {"has": True, "created_at": rep.created_at, "material": json.loads(rep.material)}


@router.get("/class-types", response_model=list[ClassTypeOut])
def class_types(db: Session = Depends(get_db)):
    return db.query(ClassType).all()


# Horario semanal de Manolo (hora Madrid). weekday(): 0=lunes … 6=domingo.
WEEK_SLOTS = {
    0: ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    1: ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    2: ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    3: ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    4: ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
    5: ["10:00", "11:00", "12:00"],
    6: [],
}


def _ref_today() -> date_cls:
    try:
        return datetime.strptime(settings.DEMO_TODAY, "%Y-%m-%d").date()
    except ValueError:
        return datetime.utcnow().date()


def _booked_for(db: Session, date_str: str) -> set:
    rows = (
        db.query(Booking)
        .filter(Booking.date == date_str, Booking.status.in_(["pending", "confirmed"]))
        .all()
    )
    return {b.time for b in rows}


@router.get("/availability")
def availability(date: str = settings.DEMO_TODAY, db: Session = Depends(get_db)):
    """Horas de un día = horario de Manolo menos lo ya reservado (pending/confirmed)."""
    try:
        d = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return {"date": date, "slots": []}
    if d < _ref_today():
        return {"date": date, "slots": []}
    booked = _booked_for(db, date)
    slots = [{"time": t, "is_booked": t in booked} for t in WEEK_SLOTS.get(d.weekday(), [])]
    return {"date": date, "slots": slots}


@router.get("/availability/month")
def availability_month(ym: str, db: Session = Depends(get_db)):
    """Estado de cada día del mes (para los puntos del calendario)."""
    try:
        year, month = int(ym[:4]), int(ym[5:7])
        ndays = _cal.monthrange(year, month)[1]
    except (ValueError, _cal.IllegalMonthError):
        return {"month": ym, "days": []}
    today = _ref_today()
    booked_by_date: dict[str, set] = {}
    rows = (
        db.query(Booking)
        .filter(Booking.date.like(f"{ym}-%"), Booking.status.in_(["pending", "confirmed"]))
        .all()
    )
    for b in rows:
        booked_by_date.setdefault(b.date, set()).add(b.time)
    days = []
    for dnum in range(1, ndays + 1):
        d = date_cls(year, month, dnum)
        ds = d.isoformat()
        total = WEEK_SLOTS.get(d.weekday(), [])
        free = [t for t in total if t not in booked_by_date.get(ds, set())]
        if d < today or not total:
            state = "none"
        elif len(free) == 0:
            state = "full"
        elif len(free) <= 2:
            state = "few"
        else:
            state = "available"
        days.append({"date": ds, "day": dnum, "dow": (d.weekday() + 1) % 7, "state": state, "free": len(free)})
    return {"month": ym, "days": days}


@router.get("/catalog/stats")
def catalog_stats(db: Session = Depends(get_db)):
    """Conteos reales del catálogo para las tarjetas de Biblioteca."""
    return {
        "lessons": db.query(Lesson).count(),
        "exercises": db.query(Lesson).filter(Lesson.type == "ejercicio").count(),
        "videos": db.query(Lesson).filter(Lesson.type == "video").count(),
        "audios": db.query(Vocab).count(),
    }


@router.get("/lessons", response_model=list[LessonOut])
def lessons(level: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Lesson)
    if level and level != "Todos":
        q = q.filter(Lesson.level == level)
    return q.all()


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
def lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    return lesson


@router.get("/lessons/{lesson_id}/vocab")
def lesson_vocab(lesson_id: int, db: Session = Depends(get_db)):
    rows = db.query(Vocab).filter(Vocab.lesson_id == lesson_id).order_by(Vocab.idx).all()
    return [
        {"fr": v.fr, "es": v.es, "audio": f"/audio/vocab/{audio_slug(v.fr)}.ogg"}
        for v in rows
    ]


@router.get("/aula/{aula_id}")
def aula(aula_id: str):
    return {
        "room": f"AulaFrancesManolo-{aula_id}",
        "title": "Conversación A2 · con Manolo",
        "resources": [
            {"id": 1, "title": "Les salutations", "src": "TV5Monde · audio A1", "kind": "audio"},
            {"id": 2, "title": "Ficha: le verbe être", "src": "Liveworksheet · interactivo", "kind": "worksheet"},
            {"id": 3, "title": "Vocab: la classe", "src": "Quizlet · 20 tarjetas", "kind": "vocab"},
        ],
    }

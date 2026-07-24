from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ClassType, Availability, Lesson
from ..schemas import ClassTypeOut, LessonOut
from ..config import settings

router = APIRouter(tags=["catalog"])


@router.get("/class-types", response_model=list[ClassTypeOut])
def class_types(db: Session = Depends(get_db)):
    return db.query(ClassType).all()


@router.get("/availability")
def availability(date: str = settings.DEMO_TODAY, db: Session = Depends(get_db)):
    slots = db.query(Availability).filter(Availability.date == date).order_by(Availability.time).all()
    return {"date": date, "slots": [{"time": s.time, "is_booked": s.is_booked} for s in slots]}


@router.get("/lessons", response_model=list[LessonOut])
def lessons(level: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Lesson)
    if level and level != "Todos":
        q = q.filter(Lesson.level == level)
    return q.all()


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

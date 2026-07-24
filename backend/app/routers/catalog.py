from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ClassType, Availability, Lesson, Vocab, LessonProgress, User
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

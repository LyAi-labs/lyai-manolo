import json
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, User, Lesson, LessonProgress, ClassReport
from ..auth import get_current_user, hash_password
from ..schemas import UserOut, StudentCreate, StudentCreated, FinalizeIn
from ..gemini import generate_json
from ..config import settings

router = APIRouter(tags=["admin"])


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Solo el profesor puede acceder")
    return user


@router.post("/admin/classes/finalize")
def finalize_class(data: FinalizeIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    stu = db.get(User, data.student_id)
    if not stu or stu.role != "student":
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    prompt = (
        f"Eres el asistente de Manolo, profesor de francés. Acaba de dar una clase particular a "
        f"{stu.name} (nivel {stu.level or 'A1'}). Notas del profesor sobre la clase de hoy:\n"
        f"{data.notes}\n\n"
        "Genera material de seguimiento para el alumno. Devuelve SOLO un JSON con esta forma exacta: "
        '{"resumen": "2-3 frases resumiendo la clase", '
        '"ejercicios": ["3 a 5 ejercicios cortos"], '
        '"flashcards": [{"fr": "palabra o frase en francés", "es": "traducción"}], '
        '"deberes": "1-2 frases con la tarea para la próxima clase"}. '
        "Incluye 5-8 flashcards. Instrucciones en español; ejemplos, vocabulario y flashcards en francés. "
        "Adáptalo al nivel del alumno."
    )
    try:
        material = generate_json(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"La IA no pudo generar el material: {str(e)[:100]}")
    rep = ClassReport(
        student_id=stu.id,
        teacher_notes=data.notes,
        material=json.dumps(material, ensure_ascii=False),
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return {"id": rep.id, "student": stu.name, "material": material}


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


@router.get("/admin/students/{student_id}/progress")
def student_progress(student_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    stu = db.get(User, student_id)
    if not stu or stu.role != "student":
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    done_ids = {p.lesson_id for p in db.query(LessonProgress).filter_by(user_id=student_id).all()}
    lessons = db.query(Lesson).filter(Lesson.id.in_(done_ids)).all() if done_ids else []
    return {
        "student": {"id": stu.id, "name": stu.name, "level": stu.level},
        "completed": [{"id": lo.id, "title": lo.title, "level": lo.level} for lo in lessons],
        "count": len(done_ids),
    }


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

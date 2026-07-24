from .database import SessionLocal
from .models import User, ClassType, Availability, Lesson, Booking, Vocab
from .auth import hash_password
from .config import settings
from .curriculum import CURRICULUM


def run_curriculum_seed():
    """Siembra la biblioteca con el currículo A1–A2 (24 unidades) + vocabulario.
    Idempotente: solo reescribe si el nº de lecciones no coincide."""
    db = SessionLocal()
    try:
        expected_vocab = sum(len(u.get("vocab", [])) for u in CURRICULUM)
        if (db.query(Lesson).count() == len(CURRICULUM)
                and db.query(Vocab).count() == expected_vocab):
            return
        db.query(Vocab).delete()
        db.query(Lesson).delete()
        db.flush()
        for u in CURRICULUM:
            lesson = Lesson(
                title=u["title"], level=u["level"], type=u["type"],
                meta=u["meta"], progress=0, locked=False,
            )
            db.add(lesson)
            db.flush()
            for i, (fr, es) in enumerate(u.get("vocab", [])):
                db.add(Vocab(lesson_id=lesson.id, fr=fr, es=es, idx=i))
        db.commit()
    finally:
        db.close()


def run_seed():
    """Siembra datos de ejemplo la primera vez (idempotente)."""
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        manolo = User(
            email="manolo@aula.fr", name="Manolo", role="admin",
            hashed_password=hash_password("manolo1234"),
        )
        lucia = User(
            email="lucia@demo.fr", name="Lucía", role="student", level="A2",
            hashed_password=hash_password("demo1234"), streak=5, lessons_done=12, hours=8,
        )
        marc = User(
            email="marc@demo.fr", name="Marc", role="student", level="A1",
            hashed_password=hash_password("demo1234"), streak=2, lessons_done=4, hours=3,
        )
        db.add_all([manolo, lucia, marc])
        db.flush()

        cts = [
            ClassType(code="conv", name="Conversación", description="Práctica oral guiada", duration_min=50),
            ClassType(code="gram", name="Gramática", description="Bases y ejercicios", duration_min=50),
            ClassType(code="delf", name="DELF/DALF", description="Preparación oficial", duration_min=60),
        ]
        db.add_all(cts)
        db.flush()

        for t in ["10:00", "11:00", "16:00", "17:00", "18:00", "19:00"]:
            db.add(Availability(date=settings.DEMO_TODAY, dow="JUE", day=24, time=t, is_booked=(t == "11:00")))

        db.add_all([
            Lesson(title="Les salutations", level="A1", type="video", meta="Vídeo · 8 min", progress=100),
            Lesson(title="Les nombres 0–20", level="A1", type="ejercicio", meta="Ejercicio · 10 preguntas", progress=80),
            Lesson(title="Le verbe « être »", level="A1", type="video", meta="Vídeo · 11 min", progress=60),
            Lesson(title="Le verbe « avoir »", level="A2", type="ejercicio", meta="Ejercicio · 12 preguntas", progress=30),
            Lesson(title="Les articles définis", level="A2", type="pdf", meta="PDF · 4 págs", progress=0),
            Lesson(title="Le passé composé", level="B1", type="video", meta="Vídeo · 14 min", progress=0, locked=True),
        ])

        conv, gram = cts[0], cts[1]
        db.add_all([
            Booking(user_id=lucia.id, class_type_id=conv.id, date=settings.DEMO_TODAY, time="17:00",
                    level="A2", status="confirmed", payment_status="paid",
                    room="AulaFrancesManolo-demo", when_label="Hoy · 17:00"),
            Booking(user_id=marc.id, class_type_id=gram.id, date=settings.DEMO_TODAY, time="18:00",
                    level="A1", status="confirmed", payment_status="pending",
                    room="AulaFrancesManolo-marc", when_label="Hoy · 18:00"),
            Booking(user_id=lucia.id, class_type_id=gram.id, date="2026-07-25", time="18:00",
                    level="A1→A2", status="confirmed", payment_status="pending",
                    room="AulaFrancesManolo-l2", when_label="Vie 25 · 18:00"),
            Booking(user_id=lucia.id, class_type_id=conv.id, date="2026-07-21", time="17:00",
                    level="A2", status="completed", payment_status="paid",
                    room="AulaFrancesManolo-l0", when_label="Lun 21 · completada"),
        ])
        db.commit()
    finally:
        db.close()

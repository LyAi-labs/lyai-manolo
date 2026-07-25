from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    role = Column(String, default="student")  # student | teacher | admin
    level = Column(String, nullable=True)     # A1..C1 (alumnos)
    hashed_password = Column(String, nullable=False)
    streak = Column(Integer, default=0)
    lessons_done = Column(Integer, default=0)
    hours = Column(Integer, default=0)
    lang = Column(String, default="es")       # es | fr (idioma de la interfaz)
    created_at = Column(String, nullable=True)  # ISO · alta de la cuenta ("miembro desde")


class ClassType(Base):
    __tablename__ = "class_types"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)
    name = Column(String)
    description = Column(String)
    duration_min = Column(Integer)


class Availability(Base):
    __tablename__ = "availability"
    id = Column(Integer, primary_key=True)
    date = Column(String)   # YYYY-MM-DD
    dow = Column(String)    # MIÉ, JUE...
    day = Column(Integer)
    time = Column(String)   # HH:MM
    is_booked = Column(Boolean, default=False)


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    level = Column(String)
    type = Column(String)   # video | ejercicio | pdf
    meta = Column(String)
    progress = Column(Integer, default=0)
    locked = Column(Boolean, default=False)


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    class_type_id = Column(Integer, ForeignKey("class_types.id"))
    date = Column(String)
    time = Column(String)
    level = Column(String)
    status = Column(String, default="pending")            # pending | confirmed | rejected | completed
    payment_status = Column(String, default="pending")    # paid | pending
    room = Column(String)
    when_label = Column(String)

    user = relationship("User")
    class_type = relationship("ClassType")


class Vocab(Base):
    __tablename__ = "vocab"
    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    fr = Column(String)   # palabra/expresión en francés
    es = Column(String)   # traducción en español
    idx = Column(Integer, default=0)


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), index=True)
    completed_at = Column(String)


class ClassReport(Base):
    __tablename__ = "class_reports"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    teacher_notes = Column(Text)
    material = Column(Text)   # JSON: {resumen, ejercicios[], flashcards[], deberes}
    created_at = Column(String)


class DailyStudy(Base):
    """Minutos de estudio en vivo acumulados por día (heartbeat desde lección/aula)."""
    __tablename__ = "daily_study"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    day = Column(String, index=True)   # YYYY-MM-DD
    minutes = Column(Integer, default=0)


class SkillRating(Base):
    """Dominio por habilidades (0–100) que evalúa Manolo. NULL = sin evaluar."""
    __tablename__ = "skill_ratings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    oral_comp = Column(Integer, nullable=True)
    oral_exp = Column(Integer, nullable=True)
    written_comp = Column(Integer, nullable=True)
    written_exp = Column(Integer, nullable=True)
    updated_at = Column(String)

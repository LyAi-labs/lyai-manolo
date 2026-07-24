from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="student")  # student | teacher | admin
    level = Column(String, nullable=True)     # A1..C1 (alumnos)
    hashed_password = Column(String, nullable=False)
    streak = Column(Integer, default=0)
    lessons_done = Column(Integer, default=0)
    hours = Column(Integer, default=0)


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
    status = Column(String, default="confirmed")          # confirmed | completed
    payment_status = Column(String, default="pending")    # paid | pending
    room = Column(String)
    when_label = Column(String)

    user = relationship("User")
    class_type = relationship("ClassType")

from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    username: Optional[str] = None
    name: str
    role: str
    level: Optional[str] = None
    streak: int = 0
    lessons_done: int = 0
    hours: int = 0
    lang: str = "es"


class LoginIn(BaseModel):
    identifier: str  # email o nombre de usuario
    password: str


class LangIn(BaseModel):
    lang: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class ClassTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    name: str
    description: str
    duration_min: int


class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    level: str
    type: str
    meta: str
    progress: int
    locked: bool


class BookingIn(BaseModel):
    class_type_id: int
    date: str
    time: str


class BookingOut(BaseModel):
    id: int
    type: str
    level: str
    when: str
    payment: str
    status: str
    room: str


class StudentCreate(BaseModel):
    name: str
    email: str
    level: str = "A1"
    password: Optional[str] = None


class StudentCreated(BaseModel):
    student: UserOut
    temp_password: str


class FinalizeIn(BaseModel):
    student_id: int
    notes: str

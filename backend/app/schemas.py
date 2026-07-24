from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: str
    role: str
    level: Optional[str] = None
    streak: int = 0
    lessons_done: int = 0
    hours: int = 0


class LoginIn(BaseModel):
    email: str
    password: str


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

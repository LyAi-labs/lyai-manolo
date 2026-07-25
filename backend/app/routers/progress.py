"""Tracking de progreso del alumno (Progreso v2).

Fuentes reales: lecciones completadas (LessonProgress), clases (Booking),
minutos en vivo (DailyStudy, heartbeat) y evaluación de habilidades (SkillRating,
la pone Manolo). Nada inventado: lo que aún no se mide sale vacío/"sin evaluar".
"""
from datetime import datetime, timedelta, date as date_cls

from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Lesson, LessonProgress, Booking, DailyStudy, SkillRating
from ..auth import get_current_user

router = APIRouter(tags=["progress"])

LESSON_MIN = 15  # minutos estimados que aporta completar una lección


def _now_day() -> date_cls:
    return datetime.utcnow().date()


def _minutes_by_day(db: Session, user_id: int) -> dict:
    """Minutos de estudio por día = lecciones·15 + duración de clases + heartbeat."""
    out: dict[str, int] = {}
    for p in db.query(LessonProgress).filter_by(user_id=user_id).all():
        if p.completed_at:
            d = p.completed_at[:10]
            out[d] = out.get(d, 0) + LESSON_MIN
    rows = (
        db.query(Booking)
        .filter(Booking.user_id == user_id, Booking.status.in_(["confirmed", "completed"]))
        .all()
    )
    for b in rows:
        if b.date:
            mins = b.class_type.duration_min if b.class_type else 30
            out[b.date] = out.get(b.date, 0) + (mins or 30)
    for r in db.query(DailyStudy).filter_by(user_id=user_id).all():
        out[r.day] = out.get(r.day, 0) + (r.minutes or 0)
    return out


def _streak(mbd: dict, today: date_cls) -> int:
    """Días consecutivos con actividad terminando hoy (o ayer si hoy 0)."""
    start = today if mbd.get(today.isoformat(), 0) > 0 else today - timedelta(days=1)
    n = 0
    d = start
    while mbd.get(d.isoformat(), 0) > 0:
        n += 1
        d -= timedelta(days=1)
    return n


def _persist_streak(db: Session, user: User) -> int:
    s = _streak(_minutes_by_day(db, user.id), _now_day())
    if user.streak != s:
        user.streak = s
        db.commit()
    return s


@router.post("/me/study/ping")
def study_ping(payload: dict = Body(default={}), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Heartbeat de estudio en vivo (lección/aula). Suma minutos al día de hoy."""
    minutes = max(1, min(int(payload.get("minutes", 1) or 1), 10))
    day = _now_day().isoformat()
    row = db.query(DailyStudy).filter_by(user_id=user.id, day=day).first()
    if not row:
        row = DailyStudy(user_id=user.id, day=day, minutes=0)
        db.add(row)
    row.minutes = (row.minutes or 0) + minutes
    db.commit()
    _persist_streak(db, user)
    return {"ok": True, "day": day, "minutes": row.minutes}


LEVEL_NEXT = {"A1": "A2", "A2": "B1", "B1": "B2", "B2": "C1", "C1": "C1"}


@router.get("/me/progress/full")
def progress_full(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = _now_day()
    mbd = _minutes_by_day(db, user.id)

    # --- lecciones ---
    all_lessons = db.query(Lesson).order_by(Lesson.id).all()
    total = len(all_lessons)
    progs = db.query(LessonProgress).filter_by(user_id=user.id).all()
    done_ids = {p.lesson_id for p in progs}
    done = len(done_ids)
    lessons_pct = round(done / total * 100) if total else 0

    # --- tiempo de estudio (últimos 30 vs 30 anteriores) ---
    def _sum(a, b):  # suma minutos en [a, b)
        return sum(m for d, m in mbd.items() if a.isoformat() <= d < b.isoformat())
    cur30 = _sum(today - timedelta(days=29), today + timedelta(days=1))
    prev30 = _sum(today - timedelta(days=59), today - timedelta(days=29))
    study_delta = round((cur30 - prev30) / prev30 * 100) if prev30 else None

    # --- meta semanal (minutos de lunes a hoy vs objetivo fijo 5 h) ---
    monday = today - timedelta(days=today.weekday())
    WEEK_GOAL_MIN = 300
    week_done = _sum(monday, today + timedelta(days=1))

    # --- clases (pasadas, confirmadas/completadas) ---
    bookings = db.query(Booking).filter_by(user_id=user.id).all()
    past = [b for b in bookings if b.date and b.date <= today.isoformat() and b.status in ("confirmed", "completed")]
    classes_done = len(past)
    c_cur = len([b for b in past if b.date >= (today - timedelta(days=29)).isoformat()])
    c_prev = len([b for b in past if (today - timedelta(days=59)).isoformat() <= b.date < (today - timedelta(days=29)).isoformat()])

    # --- habilidades (las pone Manolo) ---
    sk = db.query(SkillRating).filter_by(user_id=user.id).first()
    vals = [sk.oral_comp, sk.oral_exp, sk.written_comp, sk.written_exp] if sk else []
    skills = None
    if sk and all(v is not None for v in vals):
        skills = {
            "oral_comp": sk.oral_comp, "oral_exp": sk.oral_exp,
            "written_comp": sk.written_comp, "written_exp": sk.written_exp,
            "general": round(sum(vals) / 4),
        }

    # --- unidades ---
    lvl = user.level or "A1"
    units = []
    for lo in all_lessons:
        d = lo.id in done_ids
        units.append({"id": lo.id, "title": lo.title, "meta": lo.meta, "level": lo.level,
                      "pct": 100 if d else (lo.progress or 0), "done": d})

    # --- actividad reciente (lecciones + clases) ---
    lesson_by_id = {lo.id: lo for lo in all_lessons}
    feed = []
    for p in progs:
        lo = lesson_by_id.get(p.lesson_id)
        if p.completed_at:
            feed.append({"kind": "lesson", "title": lo.title if lo else "Lección",
                         "subtitle": lo.meta if lo else "", "ts": p.completed_at, "minutes": LESSON_MIN})
    for b in past:
        feed.append({"kind": "class", "title": b.class_type.name if b.class_type else "Clase",
                     "subtitle": b.level or "", "ts": f"{b.date}T{b.time or '00:00'}:00",
                     "minutes": (b.class_type.duration_min if b.class_type else 30)})
    feed.sort(key=lambda x: x["ts"], reverse=True)
    activity = feed[:6]

    # --- heatmap (6 semanas, lunes) ---
    this_monday = today - timedelta(days=today.weekday())
    start = this_monday - timedelta(weeks=5)
    heatmap = []
    for i in range(42):
        d = start + timedelta(days=i)
        m = mbd.get(d.isoformat(), 0)
        level = 0 if m == 0 else 1 if m < 15 else 2 if m < 30 else 3 if m < 60 else 4
        heatmap.append({"date": d.isoformat(), "minutes": m, "level": level})

    # --- evolución (8 semanas) ---
    evolution = []
    for w in range(7, -1, -1):
        wk_start = this_monday - timedelta(weeks=w)
        mins = sum(mbd.get((wk_start + timedelta(days=k)).isoformat(), 0) for k in range(7))
        evolution.append({"label": f"{wk_start.day}/{wk_start.month}", "minutes": mins})

    # --- logros ---
    comp_dates = sorted([p.completed_at[:10] for p in progs if p.completed_at])
    class_dates = sorted([b.date for b in past])
    streak = _persist_streak(db, user)

    def _nth(lst, n):
        return lst[n - 1] if len(lst) >= n else None
    achievements = [
        {"code": "streak5", "got": streak >= 5, "date": today.isoformat() if streak >= 5 else None},
        {"code": "lessons10", "got": done >= 10, "date": _nth(comp_dates, 10)},
        {"code": "aprendiz", "got": done >= 5, "date": _nth(comp_dates, 5)},
        {"code": "levelA2", "got": lvl in ("A2", "B1", "B2", "C1"), "date": None},
        {"code": "classes5", "got": classes_done >= 5, "date": _nth(class_dates, 5)},
        {"code": "primerPaso", "got": (done + classes_done) >= 1, "date": (comp_dates + class_dates)[0] if (comp_dates + class_dates) else None},
    ]

    # --- recomendación ---
    rec_skill = None
    if skills:
        rec_skill = min(
            [("oral_comp", skills["oral_comp"]), ("oral_exp", skills["oral_exp"]),
             ("written_comp", skills["written_comp"]), ("written_exp", skills["written_exp"])],
            key=lambda x: x[1],
        )[0]

    return {
        "stats": {
            "study_min": cur30, "study_delta": study_delta,
            "classes_done": classes_done, "classes_delta": c_cur - c_prev,
            "level": lvl, "level_next": LEVEL_NEXT.get(lvl, "C1"),
            "lessons_pct": lessons_pct, "lessons_done": done, "lessons_total": total,
            "streak": streak,
            "member_since": user.created_at,
            "week_done_min": week_done, "week_goal_min": WEEK_GOAL_MIN,
        },
        "skills": skills,
        "units": units,
        "activity": activity,
        "heatmap": heatmap,
        "evolution": evolution,
        "achievements": achievements,
        "recommend_skill": rec_skill,
    }


# --- Manolo evalúa las habilidades del alumno ---------------------------------

@router.get("/admin/students/{student_id}/skills")
def get_skills(
    student_id: int,
    admin: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if admin.role not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Solo el profesor")
    row = db.query(SkillRating).filter_by(user_id=student_id).first()
    return {
        "oral_comp": row.oral_comp if row else None,
        "oral_exp": row.oral_exp if row else None,
        "written_comp": row.written_comp if row else None,
        "written_exp": row.written_exp if row else None,
        "rated": bool(row and all(v is not None for v in (row.oral_comp, row.oral_exp, row.written_comp, row.written_exp))),
    }


@router.put("/admin/students/{student_id}/skills")
def set_skills(
    student_id: int,
    payload: dict = Body(...),
    admin: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if admin.role not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Solo el profesor")
    stu = db.get(User, student_id)
    if not stu:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    row = db.query(SkillRating).filter_by(user_id=student_id).first()
    if not row:
        row = SkillRating(user_id=student_id)
        db.add(row)
    for k in ("oral_comp", "oral_exp", "written_comp", "written_exp"):
        if k in payload and payload[k] is not None:
            row.__setattr__(k, max(0, min(int(payload[k]), 100)))
    row.updated_at = datetime.utcnow().isoformat()
    db.commit()
    return {"ok": True}

import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .database import Base, engine
from .seed import run_seed, run_curriculum_seed
from .routers import auth, catalog, bookings, admin, telegram

app = FastAPI(title="Aula Francés API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://manolo.lyai.fr", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # La BD puede tardar en aceptar conexiones aunque el healthcheck pase.
    for _ in range(15):
        try:
            Base.metadata.create_all(engine)
            break
        except OperationalError:
            time.sleep(2)
    # Migración ligera: añadir columna username si la tabla ya existía sin ella.
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR"))
    except Exception:
        pass
    run_seed()
    run_curriculum_seed()


app.include_router(auth.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(telegram.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}

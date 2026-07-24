from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg2://manolo:manolo@manolo-postgres:5432/manolo"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRE_MIN: int = 60 * 24 * 7  # 7 días
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    # Fecha "hoy" fija para que el demo cuadre con los datos sembrados.
    DEMO_TODAY: str = "2026-07-24"

    # Telegram (bot @LyAipa) — avisos de reserva + confirmación por botón.
    # El token se lee del fichero montado (single source); los chat_id y el
    # secreto del webhook llegan por env desde .env.
    TG_BOT_TOKEN: str = ""
    TG_BOT_TOKEN_FILE: str = "/run/secrets/tg_bot_token"
    TG_MANOLO_CHAT_ID: str = ""
    TG_IGNACIO_CHAT_ID: str = ""
    TG_WEBHOOK_SECRET: str = ""


settings = Settings()

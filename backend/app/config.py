from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg2://manolo:manolo@manolo-postgres:5432/manolo"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRE_MIN: int = 60 * 24 * 7  # 7 días
    # Fecha "hoy" fija para que el demo cuadre con los datos sembrados.
    DEMO_TODAY: str = "2026-07-24"


settings = Settings()

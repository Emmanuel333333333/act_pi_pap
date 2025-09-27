from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Proyecto Integrador FastAPI (Reseñas)"
    DATABASE_URL: str = "sqlite:///./app.db"
    SECRET_KEY: str = "supersecret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env.example"   # 👈 usa tu archivo .env real (no .env.example)


settings = Settings()

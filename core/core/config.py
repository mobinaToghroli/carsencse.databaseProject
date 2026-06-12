from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SQLALCHEMY_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/mechanic_db"
    JWT_SECRET_KEY: str = "bed437cc5118697a26b8060174376f5d2c6a0c1b6982799e4d8d5a876c58fb53"
    JWT_ACCESS_EXPIRE_SECONDS: int = 3600 * 5       # 5 hours
    JWT_REFRESH_EXPIRE_SECONDS: int = 3600 * 24 * 7  # 7 days

    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE_MB: int = 5
    MAX_AUDIO_SIZE_MB: int = 10
    MAX_IMAGES_PER_REPORT: int = 5
    MAX_AUDIOS_PER_REPORT: int = 2

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

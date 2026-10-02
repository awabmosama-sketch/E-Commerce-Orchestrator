from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str
    checkpoint_db_url: str = ""
    jwt_secret: str = "dev-secret"
    jwt_ttl: int = 60 * 60 * 12
    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    ecommerce_api: str = "https://api.shop.internal"
    cors: str = "http://localhost:5173"

    @property
    def checkpoint(self) -> str:
        return self.checkpoint_db_url or self.database_url

settings = Settings()
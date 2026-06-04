from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Match these EXACTLY to your .env file keys
    app_name: str = Field(alias="APP_NAME", default="DentFlow API")
    app_version: str = Field(alias="APP_VERSION", default="0.1.0")
    
    # Database Settings
    postgres_user: str = Field(alias="POSTGRES_USER")
    postgres_password: str = Field(alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(alias="POSTGRES_DB")
    db_host: str = Field(alias="DB_HOST", default="db")
    db_port: str = Field(alias="DB_PORT", default="5432")

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.db_host}:{self.db_port}/{self.postgres_db}"

    # This tells Pydantic to be "relaxed" about extra variables
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  # This is the "Magic Line" that prevents the crash
    )

settings = Settings()
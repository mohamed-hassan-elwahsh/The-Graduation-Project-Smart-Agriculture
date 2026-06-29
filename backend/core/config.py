from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    sh_client_id: str = ""
    sh_client_secret: str = ""
    
    port: int = 8000
    host: str = "0.0.0.0"
    debug: bool = True
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

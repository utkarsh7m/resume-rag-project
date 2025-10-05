from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Local Vite dev server
        "http://localhost:4173",  # Local Vite preview
        "https://resume-rag-app.railway.app",  # Production frontend URL
        "*"  # Allow all origins in development
    ]
    
    # File Storage Settings
    UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", "uploads")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "chroma_db")
    
    # API Settings
    API_RATE_LIMIT: str = os.getenv("API_RATE_LIMIT", "30/minute")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    class Config:
        env_prefix = ""

settings = Settings()
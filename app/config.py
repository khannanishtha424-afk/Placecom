import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "HSB Student Development Program (SDP) Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database URL: supports postgresql:// or sqlite:///
    # E.g., postgresql://postgres:password@localhost:5432/hsb_sdp or sqlite:///./hsb_sdp.db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hsb_sdp.db")
    
    # JWT authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hsb-placement-committee-sdp-secret-key-2026-2028")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Cohort configuration
    COHORT_NAME: str = "MBA Batch 2026–28"
    DEFAULT_BATCH_SIZE: int = 38
    
    # Business rules parameters
    MIN_LINKEDIN_MONTHLY_TARGET: int = 2
    MIN_NETWORKING_WEEKLY_TARGET: int = 2
    CERTIFICATION_MONTHLY_TARGET_ADOPTED: bool = True
    TWO_WEEK_INITIATION_CONSECUTIVE_LIMIT: int = 2

settings = Settings()

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@db:5432/learning_platform"
    SECRET_KEY: str = "Sk-proj-vjjXr48vQIVHMwHM9rrOvYE3hZWX67Nh22canP0yE7kJiRDu-Ha_3ISwDVjWSW_UD89FQVo4OpT3BlbkFJT35xx26WO7XA5DF06iRpcS-wdNrv6Hu-LTH90sG-ctttaIivFj0nHuG22zwV4s-MpIiw04CkQA"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
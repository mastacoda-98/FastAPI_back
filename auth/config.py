import os
from datetime import timedelta

# Use environment variables in production
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-to-a-secure-random-value")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

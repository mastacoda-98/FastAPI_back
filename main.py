from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

from api import users, courses, sections

app = FastAPI()

app.include_router(users.router)
app.include_router(courses.router)
app.include_router(sections.router)
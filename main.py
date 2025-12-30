from fastapi import FastAPI

from api import users, courses, sections, auth

from db.db_setup import engine, Base
from db.models import user, course


user.Base.metadata.create_all(bind=engine)
course.Base.metadata.create_all(bind=engine)


app = FastAPI()

app.include_router(users.router)
app.include_router(courses.router)
app.include_router(sections.router) 
app.include_router(auth.router)
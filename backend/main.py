from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import users, courses, sections, auth, assignments

from db.db_setup import engine, Base
from db.models import user, course


user.Base.metadata.create_all(bind=engine)
course.Base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.netlify.app",  # Replace with your Netlify domain after deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(courses.router)
app.include_router(sections.router) 
app.include_router(auth.router)
app.include_router(assignments.router)
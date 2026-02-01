from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from api import users, courses, sections, auth, assignments

from db.db_setup import async_engine, Base
from db.models import user, course


async def create_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


asyncio.run(create_tables())


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
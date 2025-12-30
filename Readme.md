to start venv source venv/bin/activate
uvicorn main:app

things to do
Quick fixes (5–15m)
Fix route path syntax (/course/{id}) so endpoints work. done
Confirm async DB setup and install asyncpg (if not already). done
Minimal schemas & utils (15–30m). later commented for now
Add password to UserCreate and add hashed_password to User model. done
Write one util: create_user_with_hashed_password (hash+save). done
Auth scaffold (30–90m)
Add login/token endpoint (issue JWT).
Add dependency get_current_user to decode JWT and load user.
Add require_teacher dependency (role check).
Add password hashing (passlib/bcrypt) and token library (python-jose).
Protect endpoints & expand utils (30–90m)
Protect create-course and enroll endpoints.
Add enroll/utils (student_courses handling).
UI + polish
Build simple UI that calls auth endpoints, then course flows.

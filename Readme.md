# FastAPI Next.js LMS

A full-stack Learning Management System (LMS) built with FastAPI and Next.js, featuring course management, user authentication, assignments, and section organization.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)

---

## Overview

This is a comprehensive Learning Management System designed to facilitate course creation, user management, and assignment tracking. The application consists of a robust FastAPI backend with PostgreSQL database and a modern Next.js frontend with Tailwind CSS styling.

---

## Tech Stack

### Backend

- **Framework**: FastAPI 0.126+
- **Runtime**: Uvicorn, Gunicorn
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: JWT (PyJWT + python-jose)
- **Password Security**: bcrypt, passlib
- **Async Support**: asyncpg
- **Environment**: Python 3.12+

### Frontend

- **Framework**: Next.js 16.1
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **UI Components**: Radix UI, Lucide React
- **Notifications**: React Toastify

---

## Prerequisites

- **Python 3.12+** - [Download](https://www.python.org)
- **Node.js 18+** - [Download](https://nodejs.org)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org)
- **Git** - [Download](https://git-scm.com)

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fastapi-next-lms
```

### 2. Set Up Environment Variables

Create a `.env` file in the **backend** directory:

```bash
cd backend
touch .env
```

Add the following variables to `.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lms_db

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up Backend

#### Create Python Virtual Environment

```bash
cd backend
python -m venv .venv
```

#### Activate Virtual Environment

**On macOS/Linux:**

```bash
source .venv/bin/activate
```

**On Windows:**

```bash
.venv\Scripts\activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

Or if using Poetry:

```bash
poetry install
```

### 4. Set Up Database

#### Create PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE lms_db;
\q
```

#### Run Alembic Migrations

```bash
alembic upgrade head
```

### 5. Set Up Frontend

```bash
cd frontend
npm install
```

---

## Running Locally

### Start Backend Server

```bash
cd backend
source .venv/bin/activate  #(I used linux, dont know for Windows)
uvicorn main:app --reload
```

Backend will be available at: **http://localhost:8000**

### Start Frontend Server

**In a new terminal:**

```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:3000**

---

## Project Structure

```
fastapi-next-lms/
├── backend/                    # FastAPI backend
│   ├── main.py                # Application entry point
│   ├── pyproject.toml         # Poetry configuration
│   ├── requirements.txt        # Python dependencies
│   ├── alembic.ini            # Alembic configuration
│   ├── alembic/               # Database migrations
│   │   └── versions/          # Migration files
│   ├── api/                   # API route handlers
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── courses.py
│   │   ├── sections.py
│   │   ├── assignments.py
│   │   └── utils/             # Route utilities
│   ├── auth/                  # Authentication logic
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   ├── schemas.py
│   │   └── utils.py
│   ├── db/                    # Database configuration
│   │   ├── db_setup.py
│   │   └── models/            # SQLAlchemy models
│   └── pydantic_schemas/      # Request/response schemas
│
├── frontend/                  # Next.js frontend
│   ├── package.json           # Node dependencies
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── layout.jsx     # Root layout
│   │   │   ├── page.jsx       # Home page
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── courses/       # Course pages
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── profile/       # Profile pages
│   │   │   └── users/         # User pages
│   │   ├── components/        # Reusable React components
│   │   │   └── ui/            # UI components
│   │   ├── context/           # React context
│   │   └── lib/               # Utilities and helpers
│   └── public/                # Static assets
│
├── Readme.md                  # This file
├── requirements.txt           # Root dependencies
└── netlify.toml              # Netlify configuration
```

---

## License & Author

**Author**: Gurpreet Singh  
**Email**: gurp3773@gmail.com

---

## Support

For issues, questions, or suggestions, please open an issue on the repository.

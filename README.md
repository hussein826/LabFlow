# 🦷 DentFlow

**DentFlow** is a modern, full-stack Dental Clinic Management SaaS designed for small-to-medium clinics. It streamlines patient records, appointment scheduling, and treatment tracking.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Query / Context API

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Security:** JWT Authentication
- **Validation:** Pydantic v2

### Database & Infrastructure
- **Primary DB:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Containerization:** Docker & Docker Compose

---

## 🏗️ Project Structure
```text
DENTFLOW/
├── backend/                # FastAPI Application
│   ├── app/                # Logic Layer
│   │   ├── api/            # Routes (Patients, Auth, etc.)
│   │   ├── core/           # Config & DB Connection
│   │   ├── crud/           # Database Operations
│   │   ├── models/         # SQLAlchemy Tables
│   │   ├── schemas/        # Pydantic Data Models
│   │   └── main.py         # App Entry Point
│   ├── .env                # Environment Secrets
│   ├── Dockerfile          # Backend Container Config
│   └── requirements.txt    # Python Dependencies
├── frontend/               # Next.js Application
├── docs/                   # Documentation & Assets
├── docker-compose.yml      # Orchestrator (Backend + DB)
└── README.md               # Project Overview
# 🦷 LabFlow

A modern, full-stack SaaS built to help Dental Laboratories ditch the paper trail and manage their entire clinic digitally. 

I built this project to solve a specific problem: labs lose track of active cases and struggle with unorganized billing. LabFlow gives them a digital command center to track jobs, view doctor volume analytics, and automatically generate PDF invoices.

---

##  Features
* **Secure Vault:** JWT-based authentication using `passlib` and `bcrypt`.
* **Live Analytics:** Visual dashboards (built with `Recharts`) to track VIP clients and job volume.
* **Automated Invoicing:** One-click generation of professional, printable PDF invoices directly in the browser.
* **Dockerized:** Instant local environment setup using Docker Compose.

---

##  Tech Stack

### Frontend (The Face)
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Visualization:** Recharts

### Backend (The Brain)
- **Framework:** FastAPI (Python 3.11+)
- **Security:** JWT Authentication
- **Database ORM:** SQLAlchemy

### Infrastructure (The Muscle)
- **Primary DB:** PostgreSQL
- **Migrations:** Alembic
- **Containerization:** Docker & Docker Compose

---

##  Project Structure
```text
LABFLOW/
├── backend/                # FastAPI Application
│   ├── app/                # Logic Layer
│   │   ├── api/            # Routes (Jobs, Auth, Billing, etc.)
│   │   ├── core/           # Config & DB Connection
│   │   ├── models/         # SQLAlchemy Tables
│   │   ├── schemas/        # Pydantic Data Models
│   │   └── main.py         # App Entry Point
│   ├── alembic/            # Database Migration Scripts
│   ├── Dockerfile          # Backend Container Config
│   └── requirements.txt    # Python Dependencies
├── frontend/               # Next.js Application
│   ├── src/app/            # Next.js App Router & Pages
│   └── package.json        # Node Dependencies
└── docker-compose.yml      # Orchestrator (Backend + DB)
```

---

##  Getting Started (Local Development)

Because this app is fully containerized, starting it up is incredibly simple.

**Prerequisites:**
* Docker Desktop installed and running.

**Installation:**

1. Clone the repository:
   ```bash
   git clone [https://github.com/hussein826/LabFlow.git](https://github.com/hussein826/LabFlow.git)
   cd LabFlow
   ```

2. Boot up the containers (Backend & PostgreSQL):
   ```bash
   docker-compose up -d --build
   ```

3. Build the database tables:
   ```bash
   docker exec -it labflow_backend alembic upgrade head
   ```

4. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

**Access the App:** `http://localhost:3000`  
**Access the API Docs:** `http://localhost:8001/docs`
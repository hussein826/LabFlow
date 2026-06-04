from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.health import router as health_router
from app.api.routes.doctors import router as doctor_router 
from app.api.routes.catalog import router as catalog_router
from app.api.routes.jobs import router as jobs_router # <-- 1. WE ADDED THIS IMPORT
from app.api.routes.billing import router as billing_router
from app.api.routes.payments import router as payments_router
from app.core.config import settings
from app.api.routes import jobs, doctors, catalog, auth

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "LabFlow backend is running"}

# Include our routers
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(doctor_router, prefix="/doctors", tags=["Doctors"]) 
app.include_router(catalog_router, prefix="/catalog", tags=["Catalog"])
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"]) # <-- 2. WE ADDED THIS ROUTE # <-- 2. WE ADDED THIS ROUTE
app.include_router(billing_router, prefix="/billing", tags=["Billing"])
app.include_router(payments_router, prefix="/payments", tags=["Payments"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
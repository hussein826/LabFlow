from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.doctor import Doctor as DoctorModel
from app.schemas.doctor import Doctor, DoctorCreate

router = APIRouter()

@router.post("/", response_model=Doctor)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    # 1. Safety Check: Does this email already exist?
    db_doctor = db.query(DoctorModel).filter(DoctorModel.email == doctor.email).first()
    if db_doctor:
        raise HTTPException(status_code=400, detail="Doctor with this email already exists")
    
    # 2. Save to Database
    new_doctor = DoctorModel(**doctor.model_dump()) # Converts the schema to a database model
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    
    return new_doctor

@router.get("/", response_model=list[Doctor])
def read_doctors(db: Session = Depends(get_db)):
    # Fetch all doctors to display in the Next.js table
    return db.query(DoctorModel).all()
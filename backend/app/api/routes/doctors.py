from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.doctor import Doctor as DoctorModel
from app.schemas.doctor import Doctor, DoctorCreate

router = APIRouter()

# --- UPGRADED: Now accepts any field for updates ---
class DoctorUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    clinic_name: str | None = None
    email: str | None = None
    phone: str | None = None

@router.post("/", response_model=Doctor)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = db.query(DoctorModel).filter(DoctorModel.email == doctor.email).first()
    if db_doctor:
        raise HTTPException(status_code=400, detail="Doctor with this email already exists")
    
    new_doctor = DoctorModel(**doctor.model_dump())
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor

@router.get("/", response_model=list[Doctor])
def read_doctors(db: Session = Depends(get_db)):
    return db.query(DoctorModel).all()

@router.put("/{doctor_id}", response_model=Doctor)
def update_doctor(doctor_id: int, doctor_update: DoctorUpdate, db: Session = Depends(get_db)):
    db_doctor = db.query(DoctorModel).filter(DoctorModel.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Dynamically update only the fields that were sent from the frontend
    update_data = doctor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_doctor, key, value)

    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = db.query(DoctorModel).filter(DoctorModel.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    db.delete(db_doctor)
    db.commit()
    return {"message": "Doctor successfully deleted"}
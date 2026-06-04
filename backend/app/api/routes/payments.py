from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.models.payment import Payment as PaymentModel
from app.models.doctor import Doctor as DoctorModel
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter()

@router.post("/", response_model=PaymentResponse)
def log_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    # 1. Make sure this doctor actually exists!
    db_doctor = db.query(DoctorModel).filter(DoctorModel.id == payment.doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # 2. Put the money in the vault
    new_payment = PaymentModel(**payment.model_dump())
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    return new_payment
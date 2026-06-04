from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.models.job import Job as JobModel
from app.models.doctor import Doctor as DoctorModel
from app.schemas.billing import InvoiceResponse
from app.models.payment import Payment as PaymentModel

router = APIRouter()

@router.get("/invoice/{doctor_id}", response_model=InvoiceResponse)
def generate_invoice(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = db.query(DoctorModel).filter(DoctorModel.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    completed_jobs = db.query(JobModel).filter(
        JobModel.doctor_id == doctor_id,
        JobModel.status == "Completed"
    ).all()
    
    total = sum(job.item.default_price for job in completed_jobs)
    
    return {
        "doctor": db_doctor,
        "jobs": completed_jobs,
        "total_amount": total
    }

@router.get("/account/{doctor_id}")
def get_account_summary(doctor_id: int, db: Session = Depends(get_db)):
    # 1. Get the Doctor
    db_doctor = db.query(DoctorModel).filter(DoctorModel.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    # 2. Total Work Done (Sum of Completed Jobs)
    completed_jobs = db.query(JobModel).filter(
        JobModel.doctor_id == doctor_id, 
        JobModel.status == "Completed"
    ).all()
    total_revenue = sum(job.item.default_price for job in completed_jobs)
    
    # 3. Total Cash Received (Sum of Payments)
    payments = db.query(PaymentModel).filter(PaymentModel.doctor_id == doctor_id).all()
    total_paid = sum(payment.amount for payment in payments)
    
    # 4. The Magic Math!
    current_balance = total_revenue - total_paid
    
    return {
        "doctor_name": f"Dr. {db_doctor.first_name} {db_doctor.last_name}",
        "total_revenue": total_revenue,
        "total_paid": total_paid,
        "current_balance": current_balance,
        "payments_history": payments
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.job import Job as JobModel
from app.schemas.job import JobCreate, JobResponse, JobUpdateStatus

router = APIRouter()

# 1. Create a new Job
@router.post("/", response_model=JobResponse)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    new_job = JobModel(**job.model_dump())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# 2. Get all Jobs (Lightning Fast Version!)
@router.get("/", response_model=list[JobResponse])
def read_jobs(db: Session = Depends(get_db)):
    # joinedload tells the database to grab the Doctor and Item in the exact same query!
    return db.query(JobModel).options(
        joinedload(JobModel.doctor),
        joinedload(JobModel.item)
    ).order_by(JobModel.due_date.asc()).all()

# 3. Update Job Status (e.g., from "Pending" to "Completed")
@router.put("/{job_id}/status", response_model=JobResponse)
def update_job_status(job_id: int, status_update: JobUpdateStatus, db: Session = Depends(get_db)):
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.status = status_update.status
    db.commit()
    db.refresh(db_job)
    return db_job

# 4. Delete a Job
@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted successfully"}



# . Full Edit / Update a Job
@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobCreate, db: Session = Depends(get_db)):
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update all the fields with the new data
    db_job.patient_name = job_update.patient_name
    db_job.due_date = job_update.due_date
    db_job.doctor_id = job_update.doctor_id
    db_job.catalog_id = job_update.catalog_id
    db_job.tooth_number = job_update.tooth_number
    db_job.shade = job_update.shade
    
    db.commit()
    db.refresh(db_job)
    return db_job
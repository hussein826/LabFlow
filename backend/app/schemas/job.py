from pydantic import BaseModel
from typing import Optional
from datetime import date

# Import our other schemas so we can return nested data!
from app.schemas.doctor import Doctor
from app.schemas.catalog import CatalogItem

class JobBase(BaseModel):
    patient_name: str
    doctor_id: int
    catalog_id: int
    tooth_number: Optional[str] = None
    shade: Optional[str] = None
    due_date: date
    status: Optional[str] = "Pending"

class JobCreate(JobBase):
    pass

class JobUpdateStatus(BaseModel):
    status: str

# This is the magic part: It will automatically return the Doctor and Item details!
class JobResponse(JobBase):
    id: int
    doctor: Doctor
    item: CatalogItem

    class Config:
        from_attributes = True
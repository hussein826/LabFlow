from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# The base data we expect from the frontend
class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    clinic_name: str
    phone: Optional[str] = None
    email: Optional[str] = None # <-- FIXED: Changed EmailStr to a regular str!

# Used for creating a doctor
class DoctorCreate(DoctorBase):
    pass

# Used for returning a doctor back to the frontend (includes ID)
class Doctor(DoctorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # This tells Pydantic to read from the SQLAlchemy model
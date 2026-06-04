from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship  # <-- We need this to connect tables!
from sqlalchemy.sql import func
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    clinic_name = Column(String, nullable=False) 
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- The Connections (Relationships) ---
    # This tells the Doctor about all their jobs
    jobs = relationship("Job", back_populates="doctor")
    
    # This tells the Doctor about all their cash payments!
    payments = relationship("Payment", back_populates="doctor")
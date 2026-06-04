from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, index=True, nullable=False)
    
    # The Foreign Keys (This connects the Job to a specific Doctor and Catalog Item)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    catalog_id = Column(Integer, ForeignKey("catalog.id"), nullable=False)
    
    # Specific details about the dental work
    tooth_number = Column(String, nullable=True) # e.g., "Upper Right 4"
    shade = Column(String, nullable=True)        # e.g., "A2" or "B1"
    status = Column(String, default="Pending")   # Pending, In Progress, Completed
    due_date = Column(Date, nullable=False)

    # Relationships (This lets FastAPI automatically fetch the Doctor's name and Item's price)
    doctor = relationship("Doctor")
    item = relationship("CatalogItem")
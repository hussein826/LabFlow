from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    amount = Column(Float, nullable=False)
    # Automatically records the exact exact second Ali logs the payment
    payment_date = Column(DateTime(timezone=True), server_default=func.now()) 
    # A helpful note like "Cash", "Bank Transfer", or "Check #123"
    reference_note = Column(String, nullable=True) 

    doctor = relationship("Doctor", back_populates="payments")
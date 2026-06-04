from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# What React sends to FastAPI
class PaymentBase(BaseModel):
    amount: float
    reference_note: Optional[str] = "Cash" # Defaults to cash since Ali is a lab

# Used when Ali clicks "Save Payment"
class PaymentCreate(PaymentBase):
    doctor_id: int

# Used when we send payment history back to React to show Ali
class PaymentResponse(PaymentBase):
    id: int
    doctor_id: int
    payment_date: datetime

    class Config:
        from_attributes = True
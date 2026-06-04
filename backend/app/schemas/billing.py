from pydantic import BaseModel
from typing import List

# We reuse the schemas you already built!
from app.schemas.doctor import Doctor
from app.schemas.job import JobResponse

class InvoiceResponse(BaseModel):
    doctor: Doctor
    jobs: List[JobResponse] # A list of all their completed jobs
    total_amount: float     # The grand total they owe Ali
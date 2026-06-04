from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from app.core.database import get_db
from app.models.user import User

router = APIRouter()

SECRET_KEY = "labflow_super_secret_master_key_2026"
ALGORITHM = "HS256"

# This is the scrambler engine!
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

# --- 1. THE SETUP VAULT (Run this once!) ---
@router.post("/setup")
def create_initial_admin(db: Session = Depends(get_db)):
    # Check if we already created the admin
    user = db.query(User).filter(User.email == "ali@labflow.com").first()
    if user:
        return {"message": "Admin account already exists!"}
    
    # Scramble the password before saving it!
    hashed_pw = pwd_context.hash("admin123")
    
    new_user = User(email="ali@labflow.com", hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    
    return {"message": "Admin created successfully in the database!"}

# --- 2. THE REAL LOGIN ROUTE ---
@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Find the user in the database
    user = db.query(User).filter(User.email == req.email).first()
    
    # 2. Verify their password against the scrambled hash
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # 3. Issue the VIP Pass
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"sub": user.email, "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}
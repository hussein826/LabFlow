from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Create the SQLAlchemy engine using the URL from your config
engine = create_engine(settings.database_url)

# 2. Create a SessionLocal class
# Each instance of this class will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create a Base class
# Our database models will inherit from this later
Base = declarative_base()

# 4. Dependency: This opens a connection when a request starts
# and automatically closes it when the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
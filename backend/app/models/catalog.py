from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class CatalogItem(Base):
    __tablename__ = "catalog"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True) # Optional details
    default_price = Column(Float, nullable=False) # E.g., 150.00
from pydantic import BaseModel
from typing import Optional

# Base data expected from the frontend
class CatalogItemBase(BaseModel):
    item_name: str
    description: Optional[str] = None
    default_price: float

# Used for creating an item
class CatalogItemCreate(CatalogItemBase):
    pass

# Used for updating an item's price
class CatalogItemUpdate(BaseModel):
    default_price: float

# Used for returning the item (includes ID)
class CatalogItem(CatalogItemBase):
    id: int

    class Config:
        from_attributes = True
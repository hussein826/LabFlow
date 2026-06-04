from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.catalog import CatalogItem as CatalogModel
from app.schemas.catalog import CatalogItem, CatalogItemCreate, CatalogItemUpdate

router = APIRouter()

@router.post("/", response_model=CatalogItem)
def create_catalog_item(item: CatalogItemCreate, db: Session = Depends(get_db)):
    # Check if item already exists to prevent duplicates
    db_item = db.query(CatalogModel).filter(CatalogModel.item_name == item.item_name).first()
    if db_item:
        raise HTTPException(status_code=400, detail="An item with this name already exists in the catalog")
    
    new_item = CatalogModel(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@router.get("/", response_model=list[CatalogItem])
def read_catalog(db: Session = Depends(get_db)):
    # Now it will ALWAYS sort by ID (1, 2, 3...) no matter when it was edited!
    return db.query(CatalogModel).order_by(CatalogModel.id.asc()).all()

@router.put("/{item_id}", response_model=CatalogItem)
def update_catalog_price(item_id: int, price_update: CatalogItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(CatalogModel).filter(CatalogModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.default_price = price_update.default_price
    db.commit()
    db.refresh(db_item)
    return db_item



@router.delete("/{item_id}")
def delete_catalog_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(CatalogModel).filter(CatalogModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}
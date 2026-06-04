from app.core.database import SessionLocal
from app.models.catalog import CatalogItem

# The exact data extracted from Ali's flyer
catalog_data = [
    {"item_name": "Zircon multilayered", "description": "Zircon", "default_price": 55.0},
    {"item_name": "Zircon layered", "description": "Zircon", "default_price": 65.0},
    {"item_name": "Full Denture (Upper + Lower)", "description": "Dentures", "default_price": 250.0},
    {"item_name": "Try-In Denture (Upper + Lower)", "description": "Dentures", "default_price": 120.0},
    {"item_name": "Conventional Full Denture (Per Arch)", "description": "Dentures", "default_price": 100.0},
    {"item_name": "Full Denture (Per Arch) + Metallic Mesh", "description": "Dentures", "default_price": 160.0},
    {"item_name": "Partial Denture", "description": "Dentures", "default_price": 160.0},
    {"item_name": "Valplast (Per Arch)", "description": "Dentures", "default_price": 130.0},
    {"item_name": "Flipper", "description": "Dentures", "default_price": 35.0},
    {"item_name": "Digital Smile Design (2D)", "description": "Smile Design & Wax", "default_price": 10.0},
    {"item_name": "Wax-Up (Per Arch)", "description": "Smile Design & Wax", "default_price": 35.0},
    {"item_name": "Whitening Splint", "description": "Splints (per arch)", "default_price": 10.0},
    {"item_name": "Night Guard Splint", "description": "Splints", "default_price": 10.0},
    {"item_name": "Metallo-Ceramic Crown", "description": "Crowns & Restorations", "default_price": 35.0},
    {"item_name": "Printed PMMA", "description": "Crowns & Restorations (per tooth)", "default_price": 10.0},
    {"item_name": "Milled PMMA", "description": "Crowns & Restorations (per tooth)", "default_price": 12.0},
    {"item_name": "Printed Inlay / Onlay", "description": "Crowns & Restorations", "default_price": 25.0},
]

# Open the database connection
db = SessionLocal()

try:
    print("⏳ Injecting Ali's Catalog into the database...")
    for item in catalog_data:
        # Check if it already exists so we don't accidentally duplicate them
        existing = db.query(CatalogItem).filter(CatalogItem.item_name == item["item_name"]).first()
        if not existing:
            new_item = CatalogItem(**item)
            db.add(new_item)
    
    # Save the changes!
    db.commit()
    print("✅ Success! All 17 items have been saved to PostgreSQL.")
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
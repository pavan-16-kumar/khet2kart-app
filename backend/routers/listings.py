from typing import Optional
from fastapi import APIRouter, Query, status
from models import CropListingCreate
from database import db

router = APIRouter(prefix="/listings", tags=["Crop Listings"])


@router.get("")
@router.get("/")
def get_listings(
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    grade: Optional[str] = Query(None),
    farmerId: Optional[str] = Query(None),
):
    """
    GET /api/listings
    Fetch all crop listings with optional filtering by query, category, grade, farmerId
    """
    listings = db.get_listings()

    if query and query.strip():
        q = query.lower()
        listings = [
            l for l in listings
            if q in l.get("cropName", "").lower()
            or q in l.get("variety", "").lower()
            or q in l.get("location", "").lower()
        ]

    if category and category != "All":
        listings = [l for l in listings if l.get("category") == category]

    if grade and grade != "All":
        listings = [l for l in listings if l.get("grade") == grade]

    if farmerId and farmerId.strip():
        listings = [l for l in listings if l.get("farmerId") == farmerId]

    return {
        "success": True,
        "count": len(listings),
        "listings": listings,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_listing(payload: CropListingCreate):
    """
    POST /api/listings
    Add a new verified crop lot listing with backend validation
    """
    new_listing = db.add_listing({
        "farmerId": payload.farmerId,
        "farmerName": payload.farmerName,
        "cropName": payload.cropName,
        "variety": payload.variety,
        "category": payload.category,
        "grade": payload.grade,
        "availableQuantity": payload.availableQuantity,
        "pricePerKg": payload.pricePerKg,
        "harvestDate": payload.harvestDate,
        "imageUrl": payload.imageUrl or "/src/assets/okra.jpg",
        "location": payload.location,
    })

    return {
        "success": True,
        "message": "Crop listing published successfully",
        "listing": new_listing,
    }

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from models import OrderCreate, OrderStatusUpdate
from database import db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("")
@router.get("/")
def get_orders(
    farmerId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    """
    GET /api/orders
    Fetch all orders with optional filter by farmerId or status
    """
    orders = db.get_orders()

    if farmerId and farmerId.strip():
        orders = [o for o in orders if o.get("farmerId") == farmerId]

    if status and status.strip():
        orders = [o for o in orders if o.get("status") == status]

    return {
        "success": True,
        "count": len(orders),
        "orders": orders,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate):
    """
    POST /api/orders
    Place a new direct order with automated stock validation and deduction
    """
    listings = db.get_listings()
    listings_map = {str(l["id"]): l for l in listings}

    # Verify inventory availability
    for item in payload.items:
        listing = listings_map.get(str(item.listingId))
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop listing not found for item: {item.cropName}",
            )
        if listing.get("availableQuantity", 0) < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for {listing.get('cropName')}. Only {listing.get('availableQuantity')} kg available.",
            )

    order_data = payload.model_dump()
    order = db.add_order(order_data)

    return {
        "success": True,
        "message": "Order placed successfully",
        "order": order,
    }


@router.patch("/{order_id}/status")
def update_order_status(order_id: str, payload: OrderStatusUpdate):
    """
    PATCH /api/orders/:id/status
    Update order fulfillment status (PENDING, FARMER_ACCEPTED, IN_TRANSIT, DELIVERED)
    """
    updated = db.update_order_status(order_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return {
        "success": True,
        "message": "Order status updated",
        "order": updated,
    }

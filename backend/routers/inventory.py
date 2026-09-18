from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from models import WastageRecordRequest
from database import db

router = APIRouter(prefix="/inventory", tags=["Inventory & Batch Tracking"])


@router.get("/batches")
def get_inventory_batches(
    crop: Optional[str] = Query(None),
    hubId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    """
    GET /api/inventory/batches
    Query batch-level produce stock with freshness health status
    """
    batches = db.get_inventory_batches(crop=crop, hub_id=hubId, status=status)
    return {
        "success": True,
        "count": len(batches),
        "batches": batches,
    }


@router.get("/summary")
def get_inventory_summary():
    """
    GET /api/inventory/summary
    Aggregated inventory metrics (Total, Fresh, Low Stock, Expiring, Damaged, Wastage)
    """
    summary = db.get_inventory_summary()
    return {
        "success": True,
        "summary": summary,
    }


@router.get("/ledger")
def get_inventory_ledger():
    """
    GET /api/inventory/ledger
    Traceable log of all stock movements (received, reserved, wastage)
    """
    movements = db.get_inventory_ledger()
    return {
        "success": True,
        "count": len(movements),
        "ledger": movements,
    }


@router.post("/record-wastage", status_code=status.HTTP_201_CREATED)
def record_wastage(payload: WastageRecordRequest):
    """
    POST /api/inventory/record-wastage
    Record spoiled or damaged stock with reason and automatic ledger balance deduction
    """
    movement = db.record_wastage(
        batch_id=payload.batchId,
        crop_name=payload.cropName,
        wastage_kg=payload.wastageKg,
        reason=payload.reason,
        actor="Store Manager",
    )
    return {
        "success": True,
        "message": f"Wastage of {payload.wastageKg} kg recorded for {payload.cropName}",
        "movement": movement,
    }

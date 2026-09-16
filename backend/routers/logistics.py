from fastapi import APIRouter, HTTPException, status
from models import TransporterTaskUpdate, BatchCreate
from database import db

router = APIRouter(prefix="/logistics", tags=["Logistics & Hub"])


@router.get("/tasks")
def get_transporter_tasks():
    """
    GET /api/logistics/tasks
    Fetch all transporter pickup and delivery tasks
    """
    return {
        "success": True,
        "tasks": db.get_transporter_tasks(),
    }


@router.patch("/tasks/{task_id}")
def update_transporter_task(task_id: int, payload: TransporterTaskUpdate):
    """
    PATCH /api/logistics/tasks/:id
    Advance or update a transporter delivery task status
    """
    updated = db.update_transporter_task(task_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return {
        "success": True,
        "task": updated,
    }


@router.get("/hub/shipments")
def get_hub_shipments():
    """
    GET /api/logistics/hub/shipments
    Fetch incoming crop lots at the collection hub
    """
    return {
        "success": True,
        "shipments": db.get_hub_shipments(),
    }


@router.post("/hub/shipments/{shipment_id}/approve")
def approve_hub_shipment(shipment_id: str):
    """
    POST /api/logistics/hub/shipments/:id/approve
    Approve quality grade for incoming shipment lot
    """
    updated = db.approve_hub_shipment(shipment_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found",
        )

    return {
        "success": True,
        "message": "Grade A approved",
        "shipment": updated,
    }


@router.post("/hub/batches")
def seal_hub_batch(payload: BatchCreate):
    """
    POST /api/logistics/hub/batches
    Seal and dispatch outbound delivery batch
    """
    batch = db.seal_hub_batch(
        payload.route or "Hyderabad Route · HYD-221",
        payload.description or "4 farmer lots · 1,280 kg",
    )

    return {
        "success": True,
        "message": "Batch sealed successfully",
        "batch": batch,
    }

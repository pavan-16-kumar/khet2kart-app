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


# Scoped Delivery Partner Endpoints (Least-Privilege)
@router.get("/driver/tasks")
def get_driver_tasks(driverId: str = "DP-HYD-042"):
    """
    GET /api/logistics/driver/tasks?driverId=...
    Least-privilege: returns ONLY deliveries assigned to this specific driver
    """
    tasks = db.get_driver_tasks(driverId)
    return {
        "success": True,
        "driverId": driverId,
        "count": len(tasks),
        "deliveries": tasks,
    }


@router.post("/driver/location")
def update_driver_location(payload: dict):
    """
    POST /api/logistics/driver/location
    Live GPS ping from driver device to update coordinates and ETA
    """
    driver_id = payload.get("driverId", "DP-HYD-042")
    lat = float(payload.get("lat", 17.4250))
    lng = float(payload.get("lng", 78.4200))
    speed = float(payload.get("speedKmh", 28.5))
    heading = float(payload.get("heading", 142.0))
    eta = int(payload.get("etaMinutes", 18))

    res = db.update_driver_location(
        driver_id=driver_id,
        lat=lat,
        lng=lng,
        speed_kmh=speed,
        heading=heading,
        eta_minutes=eta,
    )
    return res


@router.patch("/driver/deliveries/{delivery_id}/status")
def update_driver_delivery_status(delivery_id: str, payload: dict):
    """
    PATCH /api/logistics/driver/deliveries/:id/status
    Advance delivery (ACCEPTED -> PICKED_UP_FROM_HUB -> OUT_FOR_DELIVERY -> DELIVERED)
    """
    status_val = payload.get("status", "OUT_FOR_DELIVERY")
    proof_otp = payload.get("proofOtp")
    actor = payload.get("driverName", "Ravi Kumar")

    delivery = db.update_driver_delivery_status(
        delivery_id=delivery_id,
        status=status_val,
        proof_otp=proof_otp,
        actor=actor,
    )
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery task {delivery_id} not found",
        )

    return {
        "success": True,
        "message": f"Delivery status advanced to {status_val}",
        "delivery": delivery,
    }


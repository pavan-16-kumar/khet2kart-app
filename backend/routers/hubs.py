from fastapi import APIRouter, HTTPException, status
from models import AutoHubSelectRequest, IncomingReceiveRequest, OrderPickPackAdvanceRequest
from database import db

router = APIRouter(prefix="/hubs", tags=["Hubs & Fulfillment"])


@router.get("")
@router.get("/")
def get_hubs():
    """
    GET /api/hubs
    List all Khet2Kart fresh hubs with capacities and locations
    """
    return {
        "success": True,
        "hubs": db.get_hubs(),
    }


@router.post("/auto-select")
def auto_select_hub(payload: AutoHubSelectRequest):
    """
    POST /api/hubs/auto-select
    Calculates nearest hub capable of fulfilling customer's multi-item basket
    """
    items_data = [it.model_dump() for it in payload.items]
    selection = db.auto_select_hub(
        customer_address=payload.customerAddress,
        coordinates=payload.coordinates,
        items=items_data,
    )
    return {
        "success": True,
        **selection,
    }


@router.get("/{hub_id}/workload")
def get_hub_workload(hub_id: str):
    """
    GET /api/hubs/:id/workload
    Store Manager workload summary, order picking queue, and incoming shipments
    """
    workload = db.get_hub_workload(hub_id)
    return {
        "success": True,
        "workload": workload,
    }


@router.post("/incoming/{shipment_id}/receive")
def receive_incoming_stock(shipment_id: str, payload: IncomingReceiveRequest):
    """
    POST /api/hubs/incoming/:id/receive
    Record received vs rejected weights and quality inspection approval
    """
    result = db.receive_incoming_stock(
        shipment_id=shipment_id,
        expected_kg=payload.expectedKg,
        actual_kg=payload.actualKg,
        accepted_kg=payload.acceptedKg,
        rejected_kg=payload.rejectedKg,
        grade=payload.grade,
        freshness=payload.freshness,
        damage_pct=payload.damagePct,
        temperature=payload.temperature,
        decision=payload.decision,
        actor="Store Manager",
    )
    return {
        "success": True,
        "message": f"Shipment {shipment_id} processed ({payload.decision})",
        "shipment": result,
    }


@router.patch("/orders/{order_id}/pick-pack")
def update_pick_pack(order_id: str, payload: OrderPickPackAdvanceRequest):
    """
    PATCH /api/hubs/orders/:id/pick-pack
    Advance order picking and packing stages (START_PICKING, QUALITY_CHECK, PACK_ORDER, READY_FOR_DELIVERY)
    """
    task = db.update_pick_pack(
        pick_task_id=payload.pickTaskId,
        order_id=order_id,
        stage=payload.stage,
        notes=payload.notes or "",
        actor="Store Worker",
    )
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Picking task not found for order {order_id}",
        )

    return {
        "success": True,
        "message": f"Order {order_id} advanced to {task.get('status')}",
        "task": task,
    }

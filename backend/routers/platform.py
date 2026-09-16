from fastapi import APIRouter
from database import db

router = APIRouter(prefix="/platform", tags=["Platform & Admin"])


@router.get("/stats")
def get_platform_stats():
    """
    GET /api/platform/stats
    Platform overview KPIs and direct farm-to-fork impact metrics
    """
    return {
        "success": True,
        "stats": db.get_platform_stats(),
    }


@router.get("/admin/users")
def get_admin_users():
    """
    GET /api/platform/admin/users
    Returns list of verified & pending platform participants (farmers, buyers, transporters)
    """
    return {
        "success": True,
        "users": db.get_admin_users(),
    }


@router.patch("/admin/users/{user_id}/verify")
def verify_user(user_id: str):
    """
    PATCH /api/platform/admin/users/:id/verify
    Mark platform user or farmer as officially verified
    """
    verified_list = db.verify_user(user_id)
    return {
        "success": True,
        "message": f"User {user_id} verified successfully",
        "verifiedList": verified_list,
    }


@router.post("/admin/disputes/resolve")
def resolve_dispute():
    """
    POST /api/platform/admin/disputes/resolve
    Resolve open dispute with automated fair settlement
    """
    result = db.resolve_dispute()
    return {
        "success": True,
        "message": "Dispute resolved",
        "result": result,
    }

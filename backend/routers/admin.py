from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from database import db
from models import RolePermissionUpdateRequest

router = APIRouter(prefix="/admin", tags=["Admin Control Tower"])


@router.get("/overview")
def get_admin_overview():
    """
    GET /api/admin/overview
    Executive control tower telemetry: orders, revenue, hubs, drivers, inventory alerts
    """
    return {
        "success": True,
        **db.get_admin_overview(),
    }


@router.get("/orders/{order_id}/trace")
def get_order_trace(order_id: str):
    """
    GET /api/admin/orders/:id/trace
    End-to-end provenance and delivery traceability timeline
    """
    trace_data = db.get_order_trace(order_id)
    return {
        "success": True,
        **trace_data,
    }


@router.get("/audit-logs")
def get_audit_logs(limit: int = Query(50, ge=1, le=200)):
    """
    GET /api/admin/audit-logs
    Immutable ledger of system actions (Store Manager, Driver, Customer, Farmer, Admin)
    """
    logs = db.get_audit_logs(limit=limit)
    return {
        "success": True,
        "count": len(logs),
        "auditLogs": logs,
    }


@router.get("/users")
def get_admin_users(role: Optional[str] = Query(None)):
    """
    GET /api/admin/users
    Role-separated user directory with sensitive personal data masked
    """
    users = db.get_users_by_role(role)
    return {
        "success": True,
        "count": len(users),
        "users": users,
    }


@router.get("/permissions")
def get_admin_role_permissions():
    """
    GET /api/admin/permissions
    Lists all role permissions, approval state, and access grants
    """
    return {
        "success": True,
        "permissions": db.get_role_permissions(),
    }


@router.put("/permissions/{role}")
def update_admin_role_permission(role: str, payload: RolePermissionUpdateRequest):
    """
    PUT /api/admin/permissions/{role}
    Platform Admin controls permissions and access authorization for all roles
    """
    role_key = role.upper()
    valid_roles = ["FARMER", "CUSTOMER", "DELIVERY_PARTNER", "STORE_MANAGER", "ADMIN"]
    if role_key not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{role}'. Must be one of: {', '.join(valid_roles)}",
        )

    updated = db.update_role_permission(
        role=role_key,
        enabled=payload.enabled,
        permissions=payload.permissions,
        admin_approved=payload.adminApproved if payload.adminApproved is not None else True,
        updated_by="Platform Administrator",
    )
    return {
        "success": True,
        "role": role_key,
        "permission": updated,
        "message": f"Successfully updated permissions for {role_key}",
    }


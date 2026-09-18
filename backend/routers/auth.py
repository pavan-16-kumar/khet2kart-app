from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from database import db
from services.otp_service import otp_service
from dependencies import get_current_user
from supabase_client import supabase_admin, supabase

import jwt
from datetime import datetime, timedelta, timezone
import os

router = APIRouter(tags=["Auth & Roles"])

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

# --- Models ---
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class QuickRoleLoginRequest(BaseModel):
    role: str

class OAuthLoginRequest(BaseModel):
    provider: str = "google"
    role: str
    email: str
    name: str
    avatar: Optional[str] = None
    token: Optional[str] = None

# --- Helpers ---
def issue_supabase_jwt(user_id: str, phone: str, role: str, name: str = "") -> str:
    """Issues a custom JWT that matches the Supabase payload structure."""
    if not SUPABASE_JWT_SECRET:
        raise ValueError("SUPABASE_JWT_SECRET is not configured.")
        
    now = datetime.now(timezone.utc)
    payload = {
        "aud": "authenticated",
        "exp": (now + timedelta(days=30)).timestamp(),
        "iat": now.timestamp(),
        "sub": user_id,
        "phone": phone,
        "user_metadata": {
            "role": role,
            "name": name,
            "phone": phone
        },
        "role": "authenticated"
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")


# --- Routes ---
@router.get("/permissions")
def get_role_permissions():
    """
    GET /api/auth/permissions
    Returns all role access permissions configured by Platform Admin.
    """
    return {
        "success": True,
        "permissions": db.get_role_permissions(),
    }


@router.post("/register")
def register_user(req: RegisterRequest):
    """Registers a new user via Supabase Admin API."""
    try:
        if not supabase_admin:
            raise ValueError("Supabase is not configured properly.")
            
        # Create user in auth.users
        new_user = supabase_admin.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {
                "role": req.role,
                "name": req.name,
                "phone": req.phone or ""
            }
        })
        
        user_id = new_user.user.id
        
        # Issue initial token
        token = issue_supabase_jwt(user_id, req.phone or "", req.role, req.name)
        
        return {
            "success": True,
            "verificationToken": token,
            "message": "Registration successful",
            "role": req.role,
            "user": {
                "id": user_id,
                "email": req.email,
                "phone": req.phone,
                "name": req.name,
                "role": req.role
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login_user(req: LoginRequest):
    """
    Logs in the user. Since this is a Python backend proxying Supabase,
    we can use the standard supabase client to sign in and verify the password,
    then fetch their profile to construct the expected response.
    """
    try:
        if not supabase:
            raise ValueError("Supabase is not configured properly.")
            
        # Verify credentials using Supabase standard client
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        
        user = auth_response.user
        user_id = user.id
        email = user.email
        
        # Fetch profile for role and details
        role = "CUSTOMER"
        name = ""
        phone = ""
        
        profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if profile_res.data and len(profile_res.data) > 0:
            profile = profile_res.data[0]
            role = profile.get("role", "CUSTOMER")
            name = profile.get("full_name", "")
            phone = profile.get("phone", "")
        else:
            # Fallback to metadata if profile trigger failed
            meta = user.user_metadata or {}
            role = meta.get("role", "CUSTOMER")
            name = meta.get("name", "")
            phone = meta.get("phone", "")

        # Re-issue our custom format token (or we could just use auth_response.session.access_token)
        # Using our custom token keeps it consistent with the previous setup
        token = issue_supabase_jwt(user_id, phone, role, name)
        
        return {
            "success": True,
            "verificationToken": token,
            "message": "Login successful",
            "role": role,
            "user": {
                "id": user_id,
                "email": email,
                "phone": phone,
                "name": name,
                "role": role
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")



@router.post("/quick-role-login")
def quick_role_login(req: QuickRoleLoginRequest):
    """Mock login for demo purposes based on selected role."""
    phone = "9876543210" # Default mock phone
    if req.role == "FARMER":
        phone = "9876543210" # Ramesh Naik
    elif req.role == "ADMIN":
        phone = "9999999999"
        
    token = issue_supabase_jwt(f"demo-{req.role}", phone, req.role, f"Demo {req.role}")
    
    return {
        "success": True,
        "verificationToken": token,
        "message": f"Logged in as {req.role}",
        "role": req.role,
        "user": {
            "id": f"demo-{req.role}",
            "phone": phone,
            "name": f"Demo {req.role}",
            "role": req.role
        }
    }


@router.post("/oauth")
def oauth_login(req: OAuthLoginRequest):
    """Mock OAuth login for demo purposes."""
    token = issue_supabase_jwt(f"oauth-{req.email}", "0000000000", req.role, req.name)
    return {
        "success": True,
        "verificationToken": token,
        "message": "OAuth login successful",
        "role": req.role,
        "user": {
            "id": f"oauth-{req.email}",
            "phone": "0000000000",
            "name": req.name,
            "role": req.role,
            "email": req.email
        }
    }

@router.get("/me")
def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Returns the current logged-in user profile"""
    if supabase:
        profile_res = supabase.table("profiles").select("*").eq("id", user["id"]).execute()
        if profile_res.data:
            profile = profile_res.data[0]
            return {
                "success": True,
                "user": {
                    "id": profile["id"],
                    "phone": profile.get("phone", user["phone"]),
                    "name": profile.get("full_name", user["name"]),
                    "role": profile.get("role", user["role"])
                }
            }
            
    # Fallback to token data
    return {
        "success": True,
        "user": user
    }



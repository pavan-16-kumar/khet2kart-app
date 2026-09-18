from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.jwt_service import jwt_service

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt_service.decode_access_token(token)
        
        # Supabase payload structure:
        # {
        #   "sub": "user_id",
        #   "user_metadata": { "role": "FARMER", "name": "Ramesh Naik", "phone": "9876543201" }
        #   ...
        # }
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("No user ID found in token")
            
        user_metadata = payload.get("user_metadata", {})
        role = user_metadata.get("role", "CUSTOMER")
        
        return {
            "id": user_id,
            "role": role,
            "phone": payload.get("phone") or user_metadata.get("phone"),
            "name": user_metadata.get("name", ""),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_role(allowed_roles: list[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of {allowed_roles}"
            )
        return user
    return role_checker

import os
import jwt
from datetime import datetime, timedelta, timezone

# For Supabase, the JWT Secret is found in your Supabase dashboard (Project Settings -> API -> JWT Secret)
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

class JWTService:
    def decode_access_token(self, token: str) -> dict:
        if not SUPABASE_JWT_SECRET:
            # During early development or if missing, fail securely
            raise ValueError("SUPABASE_JWT_SECRET is not configured in backend")
            
        try:
            # Supabase tokens are signed using HS256 with the SUPABASE_JWT_SECRET
            # The audience is usually "authenticated"
            payload = jwt.decode(
                token, 
                SUPABASE_JWT_SECRET, 
                algorithms=["HS256"],
                audience="authenticated"
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.PyJWTError as e:
            raise ValueError(f"Invalid token: {str(e)}")

jwt_service = JWTService()

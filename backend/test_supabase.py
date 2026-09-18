import sys
import os
from supabase_client import supabase, supabase_admin
from services.jwt_service import jwt_service

def test_supabase():
    print("Testing Supabase Connections...")
    if supabase:
        print("✅ Default Supabase Client initialized.")
    else:
        print("❌ Failed to initialize Default Supabase Client.")

    if supabase_admin:
        print("✅ Admin Supabase Client initialized.")
    else:
        print("❌ Failed to initialize Admin Supabase Client.")

    print("\nValidating Environment Variables:")
    jwt_secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    service_role = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    
    if jwt_secret.startswith("http"):
        print("❌ SUPABASE_JWT_SECRET looks like a URL! It should be a secret string from Project Settings -> API -> JWT Settings.")
    else:
        print("✅ SUPABASE_JWT_SECRET format looks correct.")
        
    if service_role.startswith("sb_publishable_"):
        print("❌ SUPABASE_SERVICE_ROLE_KEY looks like the public anon key! It should be the 'service_role' secret from Project Settings -> API.")
    else:
        print("✅ SUPABASE_SERVICE_ROLE_KEY format looks correct.")
        
    print("\nTrying to query Supabase Database:")
    try:
        res = supabase.table("profiles").select("id").limit(1).execute()
        print("✅ Connection to profiles table successful!")
    except Exception as e:
        print(f"❌ Failed to query database: {e}")

if __name__ == "__main__":
    test_supabase()

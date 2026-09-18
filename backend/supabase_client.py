import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables if not already loaded
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def get_supabase_client() -> Client:
    """
    Returns a Supabase client using the Anon/Public key.
    Use this for operations where RLS (Row Level Security) should be enforced based on the user's token.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_service_client() -> Client:
    """
    Returns a Supabase client using the Service Role key.
    WARNING: This bypasses all Row Level Security (RLS) policies.
    Use this ONLY for backend admin tasks, such as creating/updating user profiles securely.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment variables.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Initialize default client instances for ease of import
try:
    supabase: Client = get_supabase_client()
except ValueError:
    supabase = None

try:
    supabase_admin: Client = get_supabase_service_client()
except ValueError:
    supabase_admin = None

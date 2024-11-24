import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_PROJECT_URL: str = os.getenv('SUPABASE_PROJECT_URL')
SUPABASE_API_KEY: str = os.getenv('SUPABASE_API_KEY')
supabase = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)
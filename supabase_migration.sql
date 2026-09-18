-- ==============================================================================
-- Khet2Kart Authentication & Authorization SQL Migration
-- Run this script in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Create the Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER', -- Roles: FARMER, CUSTOMER, STAFF, ADMIN, DP
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile (but not their role!)
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public can read profiles (useful for displaying Farmer names on listings)
-- Alternatively, restrict this to authenticated users only:
CREATE POLICY "Authenticated users can view basic profile info" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 4. Trigger for Automatic Profile Creation
-- Automatically creates a profile row when a new user signs up via OTP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.phone, 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- DONE.
-- ==============================================================================

-- Khet2Kart Full Supabase Schema
-- Run this in your Supabase SQL Editor to create all necessary tables.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Authentication mapping)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    phone TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. FARMERS
CREATE TABLE IF NOT EXISTS public.farmers (
    id TEXT PRIMARY KEY,
    farmer_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    state TEXT,
    district TEXT,
    village TEXT,
    farm_area DECIMAL(10,2),
    main_crops TEXT,
    years_farming INT,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. HUBS
CREATE TABLE IF NOT EXISTS public.hubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    coverage_radius_km DECIMAL(10,2),
    capacity_kg DECIMAL(10,2),
    current_stock_kg DECIMAL(10,2) DEFAULT 0,
    status TEXT,
    manager TEXT,
    available_crops TEXT[]
);


-- 4. LISTINGS (Crop Inventory)
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    listing_id TEXT UNIQUE NOT NULL,
    farmer_id TEXT REFERENCES public.farmers(farmer_id),
    farmer_name TEXT,
    crop_name TEXT NOT NULL,
    variety TEXT,
    category TEXT,
    grade TEXT,
    available_quantity DECIMAL(10,2),
    price_per_kg DECIMAL(10,2),
    harvest_date TEXT,
    image_url TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 5. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    farmer_id TEXT REFERENCES public.farmers(farmer_id),
    crop_name TEXT,
    quantity DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    payment_method TEXT,
    buyer TEXT,
    delivery_address TEXT,
    hub_id TEXT REFERENCES public.hubs(id),
    hub_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_ref TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    listing_id TEXT REFERENCES public.listings(id),
    crop_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL
);


-- 6. INVENTORY BATCHES
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    batch_id TEXT PRIMARY KEY,
    crop_name TEXT NOT NULL,
    farmer_id TEXT REFERENCES public.farmers(farmer_id),
    farmer_name TEXT,
    quantity_kg DECIMAL(10,2) NOT NULL,
    grade TEXT,
    harvest_date TEXT,
    age_days INT,
    shelf_life_days INT,
    hub_id TEXT REFERENCES public.hubs(id),
    status TEXT,
    price_per_kg DECIMAL(10,2),
    temperature TEXT
);


-- 7. INVENTORY MOVEMENTS (Ledger)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    batch_id TEXT REFERENCES public.inventory_batches(batch_id),
    crop_name TEXT,
    actor TEXT,
    action TEXT,
    quantity_change DECIMAL(10,2),
    previous_balance DECIMAL(10,2),
    new_balance DECIMAL(10,2),
    reference TEXT
);


-- 8. HUB SHIPMENTS (Incoming from Farmers)
CREATE TABLE IF NOT EXISTS public.hub_shipments (
    id TEXT PRIMARY KEY,
    farmer TEXT,
    farmer_id TEXT REFERENCES public.farmers(farmer_id),
    crop TEXT NOT NULL,
    expected_kg DECIMAL(10,2),
    actual_kg DECIMAL(10,2),
    accepted_kg DECIMAL(10,2),
    rejected_kg DECIMAL(10,2),
    grade TEXT,
    freshness TEXT,
    damage_pct DECIMAL(5,2),
    temperature TEXT,
    status TEXT,
    hub_id TEXT REFERENCES public.hubs(id),
    eta TEXT
);


-- 9. PICKING TASKS (Warehouse Picking)
CREATE TABLE IF NOT EXISTS public.picking_tasks (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    address TEXT,
    total_weight_kg DECIMAL(10,2),
    status TEXT,
    assigned_driver TEXT,
    hub_id TEXT REFERENCES public.hubs(id),
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.picking_task_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id TEXT REFERENCES public.picking_tasks(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    qty_kg DECIMAL(10,2) NOT NULL,
    batch_id TEXT,
    picked BOOLEAN DEFAULT false
);


-- 10. TRANSPORTER TASKS
CREATE TABLE IF NOT EXISTS public.transporter_tasks (
    id SERIAL PRIMARY KEY,
    status TEXT,
    crop TEXT,
    quantity TEXT,
    from_location TEXT,
    to_location TEXT,
    distance TEXT
);


-- 11. DRIVER DELIVERIES
CREATE TABLE IF NOT EXISTS public.driver_deliveries (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    driver_id TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    hub_name TEXT,
    hub_address TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    items_summary TEXT,
    pickup_distance TEXT,
    dropoff_distance TEXT,
    current_driver_lat DECIMAL(10,6),
    current_driver_lng DECIMAL(10,6),
    eta_minutes INT,
    status TEXT,
    created_at TEXT
);


-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    role TEXT,
    actor TEXT,
    action TEXT,
    details TEXT
);


-- Turn off RLS for these tables temporarily to allow backend full access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_task_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporter_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

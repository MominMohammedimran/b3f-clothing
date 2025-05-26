
-- Schema for the application database
-- This file defines the database schema in a declarative way

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================
-- Product Catalog
-- =============================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants Table (e.g. size, color)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  additional_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stored procedures
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_order_number TEXT,
  p_total NUMERIC,
  p_status TEXT,
  p_items JSONB,
  p_payment_method TEXT,
  p_delivery_fee NUMERIC,
  p_shipping_address JSONB,
  p_payment_details JSONB -- ✅ ADD THIS
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_result JSON;
BEGIN
  INSERT INTO public.orders (
    user_id, order_number, total, status, items,
    payment_method, delivery_fee, shipping_address, payment_details -- ✅ ADD
  ) VALUES (
    p_user_id, p_order_number, p_total, p_status, p_items,
    p_payment_method, p_delivery_fee, p_shipping_address, p_payment_details -- ✅ ADD
  )
  RETURNING id INTO v_order_id;

  SELECT row_to_json(o) INTO v_result
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION create_order_tracking(
  p_order_id UUID,
  p_status TEXT,
  p_current_location TEXT,
  p_estimated_delivery TEXT,
  p_history JSONB
) RETURNS JSON AS $$
DECLARE
  v_tracking_id UUID;
  v_result JSON;
BEGIN
  INSERT INTO public.order_tracking (
    order_id, status, current_location, estimated_delivery, history
  ) VALUES (
    p_order_id, p_status, p_current_location, p_estimated_delivery::TIMESTAMP WITH TIME ZONE, p_history
  )
  RETURNING id INTO v_tracking_id;
  
  SELECT row_to_json(t) INTO v_result
  FROM public.order_tracking t
  WHERE t.id = v_tracking_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_by_id(order_id UUID) 
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT row_to_json(o)
  INTO v_result
  FROM public.orders o
  WHERE o.id = order_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_tracking(order_id UUID) 
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT row_to_json(t)
  INTO v_result
  FROM public.order_tracking t
  WHERE t.order_id = order_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_location_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for addresses
CREATE POLICY "Users can manage their own addresses"
  ON public.addresses
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order tracking
CREATE POLICY "Users can view tracking for their own orders"
  ON public.order_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for carts
CREATE POLICY "Users can manage their own cart"
  ON public.carts
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for wishlists
CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlists
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for locations (public read)
CREATE POLICY "Public can view locations"
  ON public.locations
  FOR SELECT
  USING (true);

-- RLS Policies for user location preferences
CREATE POLICY "Users can manage their own location preferences"
  ON public.user_location_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for admin users
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (
    auth.email() IN (SELECT email FROM public.admin_users)
  );

-- Insert initial data
INSERT INTO public.locations (name, code)
VALUES 
  ('Karnataka', 'KA'),
  ('Tamil Nadu', 'TN'),
  ('Kerala', 'KL'),
  ('Andhra Pradesh', 'AP')
ON CONFLICT (code) DO NOTHING;

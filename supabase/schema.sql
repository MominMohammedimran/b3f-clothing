
-- Schema for the application database
-- This file defines the database schema in a declarative way

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipcode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  items JSONB NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  delivery_fee NUMERIC DEFAULT 0,
  shipping_address JSONB,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  current_location TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  color TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_location_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product inventory table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 0,
  image TEXT,
  images JSONB,
  rating NUMERIC DEFAULT 0,
  category TEXT NOT NULL,
  tags JSONB,
  sizes JSONB,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  p_shipping_address JSONB
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_result JSON;
BEGIN
  INSERT INTO public.orders (
    user_id, order_number, total, status, items, payment_method, delivery_fee, shipping_address
  ) VALUES (
    p_user_id, p_order_number, p_total, p_status, p_items, p_payment_method, p_delivery_fee, p_shipping_address
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
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for products
CREATE POLICY "Public can view products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
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

-- Insert product inventory data
INSERT INTO public.products (name, category, price, original_price, stock)
VALUES 
  ('tshirt_S', 'inventory', 0, 0, 10),
  ('tshirt_M', 'inventory', 0, 0, 15),
  ('tshirt_L', 'inventory', 0, 0, 8),
  ('tshirt_XL', 'inventory', 0, 0, 5),
  ('mug_Standard', 'inventory', 0, 0, 20),
  ('cap_Standard', 'inventory', 0, 0, 12)
ON CONFLICT (name) DO NOTHING;

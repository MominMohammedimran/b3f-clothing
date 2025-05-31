
-- Generic schemas to support the e-commerce application

-- Create orders table if it doesn't exist already
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

-- Order tracking table
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

-- User designs table
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_type TEXT NOT NULL,
  design_data TEXT NOT NULL,
  thumbnail TEXT,
  selected_sizes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Insert initial locations
INSERT INTO public.locations (name, code, is_active)
VALUES 
  ('Karnataka', 'KA', true),
  ('Andhra Pradesh', 'AP', true),
  ('Tamil Nadu', 'TN', true),
  ('Kerala', 'KL', true)
ON CONFLICT (code) DO NOTHING;

-- Create stored procedure for creating orders
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

-- Create stored procedure for creating order tracking
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

-- Create stored procedure for fetching order by ID
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

-- Create stored procedure for fetching order tracking
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

-- Add RLS policies for all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Order tracking RLS policies
CREATE POLICY "Users can view tracking for their own orders"
  ON public.order_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- Designs RLS policies
CREATE POLICY "Users can view their own designs"
  ON public.designs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.designs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Locations RLS policies (public read, admin write)
CREATE POLICY "Public can view locations"
  ON public.locations
  FOR SELECT
  USING (true);

-- Admin users RLS policies
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (
    auth.email() IN (SELECT email FROM public.admin_users)
  );

-- Wishlist RLS policies
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlists
  FOR ALL
  USING (auth.uid() = user_id);

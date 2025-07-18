-- UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================
-- Products and related tables
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

-- Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  additional_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB,
  payment_method TEXT,
  delivery_fee NUMERIC,
  shipping_address JSONB,
  payment_details JSONB, -- ✅ payment details added
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upi_input text
);
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  status text,
  created_at timestamp default now()
);


-- =============================
-- RLS Policies for Orders
-- =============================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Enable RLS on payments table
alter table payments enable row level security;
ALTER TABLE orders  ADD COLUMN upi_input TEXT;S

-- Allow insert from any user (adjust for your auth logic)
create policy "Allow insert for all"
on payments
for insert
using (true);

ALTER TABLE orders ADD COLUMN reward_points_used integer DEFAULT 0;

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
ALTER TABLE carts
ADD COLUMN sizes JSONB;

-- Optional: Drop old size & quantity if you want:
ALTER TABLE carts DROP COLUMN size;
ALTER TABLE carts DROP COLUMN quantity;
CREATE POLICY "Allow users to delete unpaid orders"
ON orders
FOR DELETE
USING (
  auth.uid() = user_id
  AND (payment_status IS NULL OR payment_status != 'paid')
);

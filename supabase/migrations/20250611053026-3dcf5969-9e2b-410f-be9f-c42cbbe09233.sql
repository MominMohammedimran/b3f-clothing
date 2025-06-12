
-- Create admin_settings table for storing application settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'B3F Prints',
  site_description TEXT DEFAULT 'Custom printing services',
  contact_email TEXT DEFAULT 'contact@b3fprints.com',
  contact_phone TEXT DEFAULT '+91 9999999999',
  business_address TEXT DEFAULT 'India',
  delivery_fee NUMERIC DEFAULT 80,
  min_order_amount NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings if not exists
INSERT INTO public.admin_settings (id, site_name, site_description, contact_email, contact_phone, business_address, delivery_fee, min_order_amount)
VALUES (1, 'B3F Prints', 'Custom printing services', 'contact@b3fprints.com', '+91 9999999999', 'India', 80, 100)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (you can modify this based on your admin authentication)
CREATE POLICY "Admin can manage settings" ON public.admin_settings
  FOR ALL USING (true);

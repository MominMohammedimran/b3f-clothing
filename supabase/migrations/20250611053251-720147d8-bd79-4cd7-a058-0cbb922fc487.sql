
-- Create function to get admin settings
CREATE OR REPLACE FUNCTION public.get_admin_settings()
RETURNS TABLE (
  id INTEGER,
  site_name TEXT,
  site_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  business_address TEXT,
  delivery_fee NUMERIC,
  min_order_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.site_name,
    s.site_description,
    s.contact_email,
    s.contact_phone,
    s.business_address,
    s.delivery_fee,
    s.min_order_amount,
    s.created_at,
    s.updated_at
  FROM public.admin_settings s;
END;
$$;

-- Create function to update admin settings
CREATE OR REPLACE FUNCTION public.update_admin_settings(
  p_site_name TEXT,
  p_site_description TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_business_address TEXT,
  p_delivery_fee NUMERIC,
  p_min_order_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_settings (
    id, site_name, site_description, contact_email, contact_phone, 
    business_address, delivery_fee, min_order_amount, updated_at
  )
  VALUES (
    1, p_site_name, p_site_description, p_contact_email, p_contact_phone,
    p_business_address, p_delivery_fee, p_min_order_amount, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    site_description = EXCLUDED.site_description,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    business_address = EXCLUDED.business_address,
    delivery_fee = EXCLUDED.delivery_fee,
    min_order_amount = EXCLUDED.min_order_amount,
    updated_at = now();
END;
$$;

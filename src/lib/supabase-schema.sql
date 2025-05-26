-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy if it exists
DROP POLICY IF EXISTS "Allow auth users to view admin_users" ON public.admin_users;

-- Secure policy: only admins can read their own row
CREATE POLICY "Admins can read their own row"
  ON public.admin_users
  FOR SELECT
  USING (email = auth.email());

-- Safe is_admin function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
      AND role = ANY (ARRAY['admin', 'super_admin'])
  );
END;
$$;

-- Example: Admin policy on orders table (uses is_admin())
CREATE POLICY "Admins can read all data"
  ON public.orders
  FOR SELECT
  USING (
    is_admin(auth.email())
  );

CREATE POLICY "Admins can update all data"
  ON public.orders
  FOR UPDATE
  USING (
    is_admin(auth.email())
  );

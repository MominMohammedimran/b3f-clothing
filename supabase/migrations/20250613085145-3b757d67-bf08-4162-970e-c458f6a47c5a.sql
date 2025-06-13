
-- Create retry payment edge function for Razorpay orders
CREATE OR REPLACE FUNCTION public.create_razorpay_retry_order(
  p_order_id uuid,
  p_amount numeric,
  p_currency text DEFAULT 'INR'
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_exists boolean;
  v_result json;
BEGIN
  -- Check if order exists and payment is pending
  SELECT EXISTS(
    SELECT 1 FROM public.orders 
    WHERE id = p_order_id 
    AND payment_status IN ('pending', 'failed')
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RETURN json_build_object('error', 'Order not found or payment already completed');
  END IF;
  
  -- Reset order to pending status for retry
  UPDATE public.orders 
  SET 
    payment_status = 'pending',
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Return order details for Razorpay
  SELECT json_build_object(
    'order_id', p_order_id,
    'amount', p_amount * 100, -- Convert to paise
    'currency', p_currency,
    'status', 'created'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Update product stock function
CREATE OR REPLACE FUNCTION public.update_product_stock(
  p_product_id text,
  p_size text,
  p_quantity integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_variants jsonb;
  v_updated_variants jsonb;
  v_variant jsonb;
  v_found boolean := false;
BEGIN
  -- Get current variants
  SELECT variants INTO v_current_variants
  FROM public.products
  WHERE id::text = p_product_id OR productId = p_product_id;
  
  -- Initialize if null
  IF v_current_variants IS NULL THEN
    v_current_variants := '[]'::jsonb;
  END IF;
  
  -- Update or add variant
  v_updated_variants := '[]'::jsonb;
  
  FOR v_variant IN SELECT * FROM jsonb_array_elements(v_current_variants)
  LOOP
    IF v_variant->>'size' = p_size THEN
      -- Update existing variant
      v_updated_variants := v_updated_variants || jsonb_build_array(
        jsonb_build_object(
          'size', p_size,
          'stock', GREATEST(0, (v_variant->>'stock')::integer - p_quantity)
        )
      );
      v_found := true;
    ELSE
      -- Keep other variants unchanged
      v_updated_variants := v_updated_variants || jsonb_build_array(v_variant);
    END IF;
  END LOOP;
  
  -- If size not found, add new variant with reduced stock
  IF NOT v_found THEN
    v_updated_variants := v_updated_variants || jsonb_build_array(
      jsonb_build_object(
        'size', p_size,
        'stock', GREATEST(0, 100 - p_quantity) -- Default stock minus quantity
      )
    );
  END IF;
  
  -- Update the product
  UPDATE public.products
  SET 
    variants = v_updated_variants,
    stock = (
      SELECT SUM((variant->>'stock')::integer)
      FROM jsonb_array_elements(v_updated_variants) AS variant
    ),
    updated_at = NOW()
  WHERE id::text = p_product_id OR productId = p_product_id;
END;
$$;

-- Remove rating column constraint from products table if it exists
DO $$
BEGIN
  -- Check if rating column exists and remove it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'rating'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.products DROP COLUMN rating;
  END IF;
END $$;

-- Update admin settings function
CREATE OR REPLACE FUNCTION public.get_delivery_settings()
RETURNS TABLE(delivery_fee numeric, min_order_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.delivery_fee, 80) as delivery_fee,
    COALESCE(s.min_order_amount, 100) as min_order_amount
  FROM public.admin_settings s
  WHERE s.id = 1
  LIMIT 1;
  
  -- If no settings found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT 80::numeric as delivery_fee, 100::numeric as min_order_amount;
  END IF;
END;
$$;


-- Add separate payment_status and order_status fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'payment_pending';

-- Update existing orders to have proper status separation
UPDATE public.orders 
SET 
  payment_status = CASE 
    WHEN payment_method = 'razorpay' AND status IN ('confirmed', 'shipped', 'delivered', 'processing') THEN 'paid'
    WHEN payment_method = 'razorpay' AND status = 'pending' THEN 'pending'
    ELSE 'paid'
  END,
  order_status = CASE 
    WHEN payment_method = 'razorpay' AND status = 'pending' THEN 'payment_pending'
    WHEN status IN ('confirmed', 'shipped', 'delivered', 'processing') THEN status
    ELSE 'pending'
  END
WHERE payment_status IS NULL OR order_status IS NULL;

-- Create function to handle payment status updates
CREATE OR REPLACE FUNCTION public.update_payment_status(
  p_order_id UUID,
  p_payment_status TEXT,
  p_order_status TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.orders 
  SET 
    payment_status = p_payment_status,
    order_status = COALESCE(p_order_status, order_status),
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$;

-- Create function to retry payment (generates new payment intent)
CREATE OR REPLACE FUNCTION public.retry_payment(
  p_order_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order JSON;
BEGIN
  -- Reset payment status to pending for retry
  UPDATE public.orders 
  SET 
    payment_status = 'pending',
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Return order details for payment retry
  SELECT row_to_json(o) INTO v_order
  FROM public.orders o
  WHERE o.id = p_order_id;
  
  RETURN v_order;
END;
$$;

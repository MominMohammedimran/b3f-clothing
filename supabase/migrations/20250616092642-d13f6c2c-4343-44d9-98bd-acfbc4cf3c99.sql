
-- Check if sizes column exists and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'sizes') THEN
        ALTER TABLE carts ADD COLUMN sizes JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Check if metadata column exists and add it if it doesn't  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carts' AND column_name = 'metadata') THEN
        ALTER TABLE carts ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Update existing cart items to use new sizes structure if they have size/quantity
UPDATE carts 
SET sizes = CASE 
  WHEN size IS NOT NULL AND quantity IS NOT NULL THEN 
    jsonb_build_array(jsonb_build_object('size', size, 'quantity', quantity))
  ELSE '[]'::jsonb
END
WHERE sizes IS NULL OR sizes = '[]'::jsonb;

-- Make sizes column not null with default empty array
ALTER TABLE carts ALTER COLUMN sizes SET DEFAULT '[]'::jsonb;
UPDATE carts SET sizes = '[]'::jsonb WHERE sizes IS NULL;
ALTER TABLE carts ALTER COLUMN sizes SET NOT NULL;

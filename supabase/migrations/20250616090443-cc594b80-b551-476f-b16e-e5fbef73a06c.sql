
-- Update carts table to support sizes as JSONB array
ALTER TABLE carts ADD COLUMN IF NOT EXISTS sizes JSONB;

-- Update existing cart items to use new sizes structure if they have size/quantity
UPDATE carts 
SET sizes = CASE 
  WHEN size IS NOT NULL AND quantity IS NOT NULL THEN 
    jsonb_build_array(jsonb_build_object('size', size, 'quantity', quantity))
  ELSE '[]'::jsonb
END
WHERE sizes IS NULL;

-- Make sizes column not null with default empty array
ALTER TABLE carts ALTER COLUMN sizes SET DEFAULT '[]'::jsonb;
UPDATE carts SET sizes = '[]'::jsonb WHERE sizes IS NULL;
ALTER TABLE carts ALTER COLUMN sizes SET NOT NULL;

-- Optional: Remove old size and quantity columns after migration
-- Uncomment these lines if you want to clean up the old columns:
-- ALTER TABLE carts DROP COLUMN IF EXISTS size;
-- ALTER TABLE carts DROP COLUMN IF EXISTS quantity;

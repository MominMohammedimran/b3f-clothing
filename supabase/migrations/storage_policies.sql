
-- Create policy to allow public read access for the public bucket
CREATE POLICY "Allow public read access for public bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public');

CREATE POLICY "Allow authenticated uploads for public bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates for public bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'public' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated deletes for public bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'public' AND auth.uid() = owner);

-- Create policy to allow public read access for the products bucket
CREATE POLICY "Allow public read access for products bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated uploads for products bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates for products bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated deletes for products bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.uid() = owner);



-- Allow read access for everyone
CREATE POLICY "Allow read access"
ON products
FOR SELECT
USING (true);

-- Allow update access for everyone (optional, secure in prod)
CREATE POLICY "Allow update access"
ON products
FOR UPDATE
USING (true);


-- Create policy to allow public read access for the public bucket
CREATE POLICY "Allow public read access for public bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- Create policy to allow authenticated users to upload to the public bucket
CREATE POLICY "Allow authenticated uploads for public bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update their own uploads in the public bucket
CREATE POLICY "Allow authenticated updates for public bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public' AND auth.uid() = owner);

-- Create policy to allow authenticated users to delete their own uploads in the public bucket
CREATE POLICY "Allow authenticated deletes for public bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'public' AND auth.uid() = owner);

-- Create policy to allow public read access for the products bucket
CREATE POLICY "Allow public read access for products bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Create policy to allow authenticated users to upload to the products bucket
CREATE POLICY "Allow authenticated uploads for products bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update their own uploads in the products bucket
CREATE POLICY "Allow authenticated updates for products bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.uid() = owner);

-- Create policy to allow authenticated users to delete their own uploads in the products bucket
CREATE POLICY "Allow authenticated deletes for products bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.uid() = owner);

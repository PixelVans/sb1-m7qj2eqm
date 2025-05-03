-- Create assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to assets (using a unique policy name)
CREATE POLICY "Assets Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'assets' );

-- Allow authenticated users to upload assets (using a unique policy name)
CREATE POLICY "Assets Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'assets' );

-- Allow users to update assets (using a unique policy name)
CREATE POLICY "Assets Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'assets' );

-- Allow users to delete assets (using a unique policy name)
CREATE POLICY "Assets Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'assets' );
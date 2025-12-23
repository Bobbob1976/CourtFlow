-- 1. Create the bucket 'club-images' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('club-images', 'club-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true; -- FORCE PUBLIC

-- 2. Allow PUBLIC READ access (so images are visible/ not broken)
DROP POLICY IF EXISTS "Public Images Read" ON storage.objects;
CREATE POLICY "Public Images Read" ON storage.objects
FOR SELECT
USING ( bucket_id = 'club-images' );

-- 3. Allow AUTHENTICATED UPLOAD access (so admin can upload)
DROP POLICY IF EXISTS "Authenticated Images Upload" ON storage.objects;
CREATE POLICY "Authenticated Images Upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'club-images'
  AND auth.role() = 'authenticated'
);

-- 4. Allow AUTHENTICATED UPDATE/DELETE access (so admin can delete)
DROP POLICY IF EXISTS "Authenticated Images Delete" ON storage.objects;
CREATE POLICY "Authenticated Images Delete" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'club-images'
  AND auth.role() = 'authenticated'
);

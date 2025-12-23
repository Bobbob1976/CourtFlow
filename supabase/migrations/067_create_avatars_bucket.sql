-- Create a new storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up proper RLS for the bucket
-- Allow public access to view avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Allow anyone to upload (for now, to simplify debugging)
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

-- Allow users to update their own avatar
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner )
  WITH CHECK ( bucket_id = 'avatars' );

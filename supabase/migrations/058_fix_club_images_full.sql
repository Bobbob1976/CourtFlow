-- FIX CLUB IMAGES FEATURE
-- Dit script fixt zowel de tabel 'club_images' als de bucket 'club-images'.

-- 1. Zorg dat de tabel bestaat en RLS policies heeft
CREATE TABLE IF NOT EXISTS club_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    image_url TEXT NOT NULL,
    image_type TEXT,
    title TEXT,
    description TEXT,
    alt_text TEXT,
    file_size BIGINT,
    mime_type TEXT,
    storage_bucket TEXT,
    storage_path TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zet RLS aan
ALTER TABLE club_images ENABLE ROW LEVEL SECURITY;

-- Verwijder oude policies
DROP POLICY IF EXISTS "Public View club_images" ON club_images;
DROP POLICY IF EXISTS "Auth Insert club_images" ON club_images;
DROP POLICY IF EXISTS "Auth Update club_images" ON club_images;
DROP POLICY IF EXISTS "Auth Delete club_images" ON club_images;

-- Nieuwe Policies (Iedereen mag kijken, Auth mag beheren)
CREATE POLICY "Public View club_images" 
ON club_images FOR SELECT 
USING (true);

CREATE POLICY "Auth Insert club_images" 
ON club_images FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth Update club_images" 
ON club_images FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Auth Delete club_images" 
ON club_images FOR DELETE 
USING (auth.role() = 'authenticated');


-- 2. FIX DE BUCKET 'club-images' (Let op: dit is een andere bucket dan club-assets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-images', 'club-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Policies (Open Deur voor Auth)
DROP POLICY IF EXISTS "Club Images Bucket Public View" ON storage.objects;
DROP POLICY IF EXISTS "Club Images Bucket Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Club Images Bucket Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Club Images Bucket Auth Delete" ON storage.objects;

-- Specifieke policies voor 'club-images' bucket
CREATE POLICY "Club Images Bucket Public View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'club-images' );

CREATE POLICY "Club Images Bucket Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'club-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Club Images Bucket Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'club-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Club Images Bucket Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'club-images' AND auth.role() = 'authenticated' );

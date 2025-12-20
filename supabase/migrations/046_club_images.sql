-- Create club_images table for custom uploaded images
CREATE TABLE IF NOT EXISTS club_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Image metadata
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('court', 'club', 'booking', 'hero', 'gallery')),
    title VARCHAR(255),
    description TEXT,
    alt_text VARCHAR(255),
    
    -- Image properties
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(50),
    
    -- Usage settings
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Supabase storage path
    storage_bucket VARCHAR(100) DEFAULT 'club-images',
    storage_path TEXT
);

-- Add indexes
CREATE INDEX idx_club_images_club_id ON club_images(club_id);
CREATE INDEX idx_club_images_type ON club_images(image_type);
CREATE INDEX idx_club_images_active ON club_images(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE club_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can manage their club's images
CREATE POLICY "Admins can view their club images"
    ON club_images FOR SELECT
    USING (
        club_id IN (
            SELECT club_id FROM club_admins 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert their club images"
    ON club_images FOR INSERT
    WITH CHECK (
        club_id IN (
            SELECT club_id FROM club_admins 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their club images"
    ON club_images FOR UPDATE
    USING (
        club_id IN (
            SELECT club_id FROM club_admins 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete their club images"
    ON club_images FOR DELETE
    USING (
        club_id IN (
            SELECT club_id FROM club_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Public can view active images
CREATE POLICY "Public can view active club images"
    ON club_images FOR SELECT
    USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_club_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_club_images_updated_at
    BEFORE UPDATE ON club_images
    FOR EACH ROW
    EXECUTE FUNCTION update_club_images_updated_at();

-- Add default images for existing clubs (optional)
INSERT INTO club_images (club_id, image_url, image_type, title, is_active, display_order)
SELECT 
    id as club_id,
    '/images/padel/padel_action_blue.png' as image_url,
    'booking' as image_type,
    'Default Booking Image' as title,
    true as is_active,
    0 as display_order
FROM clubs
WHERE NOT EXISTS (
    SELECT 1 FROM club_images WHERE club_images.club_id = clubs.id
);

COMMENT ON TABLE club_images IS 'Custom uploaded images for clubs';
COMMENT ON COLUMN club_images.image_type IS 'Type of image: court, club, booking, hero, gallery';
COMMENT ON COLUMN club_images.display_order IS 'Order for displaying multiple images (lower = first)';

-- Add branding fields to clubs table
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banner_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#C4FF0D',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#0A1628';

-- Update the demo club with some default branding so it doesn't look empty
UPDATE clubs 
SET 
  logo_url = 'https://courtflow.example.com/logo.png', -- Placeholder
  banner_url = 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600', -- Mooie Padel baan
  primary_color = '#C4FF0D'
WHERE subdomain = 'demo-club';

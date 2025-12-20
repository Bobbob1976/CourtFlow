-- Add status column to courts table
ALTER TABLE courts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance'));

-- Update existing courts to be active
UPDATE courts SET status = 'active' WHERE status IS NULL;

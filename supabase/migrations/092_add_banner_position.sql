ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS banner_position_y integer DEFAULT 20;

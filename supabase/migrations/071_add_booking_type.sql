-- Add booking_type and title columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'regular', -- 'regular', 'maintenance', 'lesson'
ADD COLUMN IF NOT EXISTS title text; -- For maintenance reason or lesson topic

-- Update existing bookings to be 'regular'
UPDATE public.bookings SET booking_type = 'regular' WHERE booking_type IS NULL;

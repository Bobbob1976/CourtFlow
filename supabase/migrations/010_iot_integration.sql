-- supabase/migrations/010_iot_integration.sql

-- Create a table to store IoT device configurations for each club
CREATE TABLE public.iot_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
    device_type TEXT NOT NULL, -- e.g., 'lighting', 'access_control'
    api_endpoint TEXT NOT NULL,
    api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow club admins to manage their IoT devices"
ON public.iot_devices
FOR ALL
USING (auth.uid() IN (
    SELECT user_id FROM public.club_staff WHERE club_id = iot_devices.club_id AND role = 'admin'
));

CREATE POLICY "Allow authenticated users to view IoT devices"
ON public.iot_devices
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create a function to be called from a webhook to control the lights
CREATE OR REPLACE FUNCTION trigger_light_system(
    booking_id_param UUID,
    action TEXT -- 'on' or 'off'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    device_config RECORD;
    booking_details RECORD;
    payload JSONB;
    response JSONB;
BEGIN
    -- Get booking details
    SELECT b.start_time, b.end_time, c.id as court_id, cl.id as club_id
    INTO booking_details
    FROM public.bookings b
    JOIN public.courts c ON b.court_id = c.id
    JOIN public.clubs cl ON c.club_id = cl.id
    WHERE b.id = booking_id_param;

    -- Find the lighting device for the club
    SELECT api_endpoint, api_key
    INTO device_config
    FROM public.iot_devices
    WHERE club_id = booking_details.club_id AND device_type = 'lighting'
    LIMIT 1;

    IF device_config IS NULL THEN
        RETURN jsonb_build_object('error', 'No lighting device configured for this club.');
    END IF;

    -- Prepare payload for the IoT device webhook
    payload := jsonb_build_object(
        'court_id', booking_details.court_id,
        'action', action,
        'start_time', booking_details.start_time,
        'end_time', booking_details.end_time,
        'booking_id', booking_id_param
    );

    -- This is a placeholder for the actual HTTP request.
    -- In a real Supabase Edge Function, you would use fetch().
    -- Since we are in PL/pgSQL, we will just return the intended action.
    -- For a real implementation, you'd use pg_net or a similar extension,
    -- or trigger an edge function.
    
    -- Simulate the webhook call
    -- SELECT http_post(device_config.api_endpoint, payload, '{"Authorization": "Bearer ' || device_config.api_key || '"}')
    -- INTO response;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Webhook triggered for ' || action,
        'endpoint', device_config.api_endpoint,
        'payload', payload
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

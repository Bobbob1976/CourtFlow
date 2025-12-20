-- supabase/migrations/011_apple_wallet.sql

-- Create a table to store Apple Wallet pass information
CREATE TABLE public.apple_wallet_passes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    pass_type_identifier TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    authentication_token TEXT NOT NULL,
    pass_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.apple_wallet_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own Apple Wallet passes"
ON public.apple_wallet_passes
FOR ALL
USING (auth.uid() = (
    SELECT user_id FROM public.bookings WHERE id = apple_wallet_passes.booking_id
));

-- Create a function to generate a new Apple Wallet pass for a booking
CREATE OR REPLACE FUNCTION generate_apple_wallet_pass(
    booking_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pass_details RECORD;
    booking_details RECORD;
    club_details RECORD;
    pass_payload JSONB;
BEGIN
    -- Get booking details
    SELECT b.*, c.name as court_name, cl.name as club_name, cl.brand_color
    INTO booking_details
    FROM public.bookings b
    JOIN public.courts c ON b.court_id = c.id
    JOIN public.clubs cl ON c.club_id = cl.id
    WHERE b.id = booking_id_param;

    -- Generate a unique serial number and auth token
    pass_details := (
        SELECT
            'pass.com.courtflow.booking' as pass_type_identifier,
            md5(random()::text) as serial_number,
            md5(random()::text) as authentication_token
    );

    -- Create the pass payload
    pass_payload := jsonb_build_object(
        'formatVersion', 1,
        'passTypeIdentifier', pass_details.pass_type_identifier,
        'serialNumber', pass_details.serial_number,
        'teamIdentifier', 'YOUR_TEAM_ID', -- Replace with your Apple Developer Team ID
        'webServiceURL', 'https://your-api.courtflow.com/apple-wallet/',
        'authenticationToken', pass_details.authentication_token,
        'organizationName', booking_details.club_name,
        'description', 'CourtFlow Booking Pass',
        'logoText', booking_details.club_name,
        'foregroundColor', 'rgb(255, 255, 255)',
        'backgroundColor', booking_details.brand_color,
        'eventTicket', jsonb_build_object(
            'primaryFields', jsonb_build_array(
                jsonb_build_object('key', 'court', 'label', 'Court', 'value', booking_details.court_name)
            ),
            'secondaryFields', jsonb_build_array(
                jsonb_build_object('key', 'date', 'label', 'Date', 'value', to_char(booking_details.booking_date, 'YYYY-MM-DD')),
                jsonb_build_object('key', 'time', 'label', 'Time', 'value', to_char(booking_details.start_time, 'HH24:MI'))
            ),
            'auxiliaryFields', jsonb_build_array(
                jsonb_build_object('key', 'club', 'label', 'Club', 'value', booking_details.club_name)
            )
        )
    );

    -- Insert the new pass into the database
    INSERT INTO public.apple_wallet_passes (
        booking_id,
        pass_type_identifier,
        serial_number,
        authentication_token,
        pass_data
    )
    VALUES (
        booking_id_param,
        pass_details.pass_type_identifier,
        pass_details.serial_number,
        pass_details.authentication_token,
        pass_payload
    );

    RETURN pass_payload;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

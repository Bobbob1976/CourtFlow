-- CHECK BOOKINGS SCHEMA (027)
-- The app says 'booking_date' does not exist. Let's see what DOES exist.

SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'bookings';

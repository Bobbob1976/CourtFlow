-- Clean up duplicate booking participants efficiently
-- Keeps the oldest record for each (booking_id, email) pair and deletes the rest.

DELETE FROM booking_participants a
USING booking_participants b
WHERE a.id > b.id 
AND a.booking_id = b.booking_id 
AND a.email = b.email;

-- CLEANUP SCRIPT
-- Verwijder alle boekingen van de super admin (om testdata te wissen)
DELETE FROM public.bookings 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'pascal.teunissen@gmail.com'
);

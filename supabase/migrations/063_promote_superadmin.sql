-- Promote Pascal to Super Admin
UPDATE public.user_profiles
SET role = 'super_admin'
WHERE email = 'pascal.teunissen@gmail.com';

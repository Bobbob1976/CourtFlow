-- Create a dummy guest user in auth.users if not exists
-- NOTE: If this fails due to permissions, you might need to run via Dashboard or create manually.
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'guest@courtflow.app', 
  '$2a$10$abcdefghijklmnopqrstuvwxyzABC', -- Dummy hash
  now(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name":"Gast Speler"}'
)
ON CONFLICT (id) DO NOTHING;

-- Ensure profile exists
INSERT INTO public.user_profiles (id, full_name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'Gast Speler', 
  'guest@courtflow.app', 
  'member'
)
ON CONFLICT (id) DO NOTHING;

-- 1. Enable RLS ensuring safety
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to read their OWN profile (Crucial for Navbar)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Allow Admins/Super Admins to view ALL profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.user_profiles 
    WHERE role IN ('admin', 'super_admin', 'club_owner')
  )
);

-- 4. Sync Missing Profiles (Insert if not exists)
INSERT INTO public.user_profiles (id, full_name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'User'), 
    email, 
    'member'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Force Promote Pascal (Again)
UPDATE public.user_profiles
SET role = 'super_admin'
WHERE email = 'pascal.teunissen@gmail.com';

-- 6. Create Trigger for Future Users (Automated Sync)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

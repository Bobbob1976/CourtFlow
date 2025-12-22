-- 1. Sync existing users from auth.users to public.user_profiles
INSERT INTO public.user_profiles (id, full_name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Admin User') as full_name, 
    email, 
    'member'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles);

-- 2. Ensure trigger exists for future users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Nieuw Lid'), 
    new.email, 
    'member'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger just in case
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

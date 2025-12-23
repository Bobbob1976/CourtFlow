-- Enable RLS on club_images
ALTER TABLE public.club_images ENABLE ROW LEVEL SECURITY;

-- 1. Allow EVERYONE to see the list of images (needed for dashboard)
DROP POLICY IF EXISTS "Public club images read" ON public.club_images;
CREATE POLICY "Public club images read" ON public.club_images
FOR SELECT USING (true);

-- 2. Allow ADMINS to manage images (insert, delete, update)
DROP POLICY IF EXISTS "Admin manage club images" ON public.club_images;
CREATE POLICY "Admin manage club images" ON public.club_images
FOR ALL USING (
    exists (
    select 1 from user_profiles
    where user_profiles.id = auth.uid()
    and user_profiles.role in ('admin', 'club_owner', 'super_admin')
    )
);

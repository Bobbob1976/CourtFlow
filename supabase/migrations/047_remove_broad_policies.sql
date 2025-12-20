-- Migration: Remove Overly Broad Policies (Safe Version)
-- Only removes the "Enable all access" policies that cause duplicates
-- Skips optimizations if columns don't exist

-- ============================================================================
-- PART 1: REMOVE "Enable all access for authenticated users" POLICIES
-- ============================================================================

-- These are the main culprits causing 120+ duplicate warnings
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tenants;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tenant_members;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.divisions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.poules;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.players;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tournaments;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.staff;

-- ============================================================================
-- PART 2: OPTIMIZE ONLY IF COLUMNS EXIST
-- ============================================================================

-- PROFILES (check for 'id' column)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow user to update their own profile') THEN
            DROP POLICY "Allow user to update their own profile" ON public.profiles;
            CREATE POLICY "Allow user to update their own profile" ON public.profiles
                FOR UPDATE USING ((SELECT auth.uid()) = id);
        END IF;
    END IF;
END $$;

-- TENANT_MEMBERS (optimize only the simple ones)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tenant_members' AND policyname = 'Enable insert for members') THEN
        DROP POLICY "Enable insert for members" ON public.tenant_members;
        CREATE POLICY "Enable insert for members" ON public.tenant_members
            FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');
    END IF;
    
    -- Optimize admin policy if it exists
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tenant_members' AND policyname = 'Allow tenant admins to manage members') THEN
        DROP POLICY "Allow tenant admins to manage members" ON public.tenant_members;
        CREATE POLICY "Allow tenant admins to manage members" ON public.tenant_members
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.tenant_members tm
                    WHERE tm.tenant_id = tenant_members.tenant_id
                    AND tm.user_id = (SELECT auth.uid())
                    AND tm.role = 'admin'
                )
            );
    END IF;
    
    -- Optimize view policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tenant_members' AND policyname = 'Allow members to view memberships in their tenants') THEN
        DROP POLICY "Allow members to view memberships in their tenants" ON public.tenant_members;
        CREATE POLICY "Allow members to view memberships in their tenants" ON public.tenant_members
            FOR SELECT USING (
                tenant_id IN (
                    SELECT tenant_id FROM public.tenant_members WHERE user_id = (SELECT auth.uid())
                )
            );
    END IF;
END $$;

-- MATCHES
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Allow authorized users to update matches') THEN
        DROP POLICY "Allow authorized users to update matches" ON public.matches;
        CREATE POLICY "Allow authorized users to update matches" ON public.matches
            FOR UPDATE USING ((SELECT auth.role()) = 'authenticated');
    END IF;
END $$;

-- ERROR_LOGS
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'error_logs' AND policyname = 'Allow superadmins to manage error logs') THEN
        DROP POLICY "Allow superadmins to manage error logs" ON public.error_logs;
        CREATE POLICY "Allow superadmins to manage error logs" ON public.error_logs
            FOR ALL USING ((SELECT auth.role()) = 'service_role');
    END IF;
END $$;

-- TENANTS (only optimize if owner_id column exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'owner_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tenants' AND policyname = 'Allow tenant owner to update their tenant') THEN
            DROP POLICY "Allow tenant owner to update their tenant" ON public.tenants;
            CREATE POLICY "Allow tenant owner to update their tenant" ON public.tenants
                FOR UPDATE USING (owner_id = (SELECT auth.uid()));
        END IF;
    END IF;
    
    -- Optimize view policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tenants' AND policyname = 'Allow member to view their own tenants') THEN
        DROP POLICY "Allow member to view their own tenants" ON public.tenants;
        CREATE POLICY "Allow member to view their own tenants" ON public.tenants
            FOR SELECT USING (
                id IN (
                    SELECT tenant_id FROM public.tenant_members WHERE user_id = (SELECT auth.uid())
                )
            );
    END IF;
END $$;

-- Success!
DO $$ 
BEGIN
    RAISE NOTICE 'Removed overly broad policies successfully!';
    RAISE NOTICE 'This should eliminate most duplicate policy warnings.';
END $$;

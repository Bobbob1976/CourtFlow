-- Migration: Enable RLS on Tournament/Competition Tables
-- Fixes the 18 new security warnings

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

-- Enable RLS on all tournament-related tables
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.poules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.divisions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIX FUNCTION SEARCH_PATH
-- ============================================================================

-- Fix handle_new_user function
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user SET search_path = public, pg_temp;
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'RLS enabled on tournament tables and function search_path secured!';
END $$;

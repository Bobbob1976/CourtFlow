-- Migration: Enable RLS and Fix Security Warnings
-- This migration addresses Supabase security recommendations
-- SAFE VERSION: Only modifies tables that exist

-- ============================================================================
-- PART 1: ENABLE ROW LEVEL SECURITY (RLS) ON EXISTING TABLES
-- ============================================================================

-- Enable RLS on tables that have policies but RLS is disabled
ALTER TABLE IF EXISTS public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clubs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tables without policies (we'll add basic policies)
ALTER TABLE IF EXISTS public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.match_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_splits ENABLE ROW LEVEL SECURITY;

-- Also enable on other critical tables if they exist
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: ADD BASIC RLS POLICIES FOR TABLES WITHOUT THEM
-- ============================================================================

-- Tax Rates: Public read, admin write
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tax_rates') THEN
        DROP POLICY IF EXISTS "Public can view tax rates" ON public.tax_rates;
        CREATE POLICY "Public can view tax rates" ON public.tax_rates
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Service role can manage tax rates" ON public.tax_rates;
        CREATE POLICY "Service role can manage tax rates" ON public.tax_rates
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Ledger Entries: Only service role (simplified - no owner check since schema varies)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ledger_entries') THEN
        DROP POLICY IF EXISTS "Service role can manage ledger" ON public.ledger_entries;
        CREATE POLICY "Service role can manage ledger" ON public.ledger_entries
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Player Ratings: Users can view their own, public can view all
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'player_ratings') THEN
        DROP POLICY IF EXISTS "Users can view all ratings" ON public.player_ratings;
        CREATE POLICY "Users can view all ratings" ON public.player_ratings
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can update own rating" ON public.player_ratings;
        CREATE POLICY "Users can update own rating" ON public.player_ratings
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Match Sets: Users involved in match can view
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'match_sets') THEN
        DROP POLICY IF EXISTS "Match participants can view sets" ON public.match_sets;
        CREATE POLICY "Match participants can view sets" ON public.match_sets
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.matches m
                    WHERE m.id = match_id
                    AND (m.booking_id IN (
                        SELECT id FROM public.bookings WHERE user_id = auth.uid()
                    ))
                )
            );
    END IF;
END $$;

-- Transactions: Users can view their own
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
        DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
        CREATE POLICY "Users can view own transactions" ON public.transactions
            FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Service role can manage transactions" ON public.transactions;
        CREATE POLICY "Service role can manage transactions" ON public.transactions
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Booking Splits: Users involved can view
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'booking_splits') THEN
        DROP POLICY IF EXISTS "Users can view their booking splits" ON public.booking_splits;
        CREATE POLICY "Users can view their booking splits" ON public.booking_splits
            FOR SELECT USING (
                auth.uid() IN (
                    SELECT user_id FROM public.bookings WHERE id = booking_id
                )
            );
    END IF;
END $$;

-- ============================================================================
-- PART 3: FIX FUNCTION SEARCH_PATH WARNINGS
-- ============================================================================

-- Update all flagged functions with secure search_path (only if they exist)
DO $$ 
BEGIN
    -- Process wallet payment
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'process_wallet_payment') THEN
        ALTER FUNCTION public.process_wallet_payment SET search_path = public, pg_temp;
    END IF;
    
    -- Get historical average
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'get_historical_average') THEN
        ALTER FUNCTION public.get_historical_average SET search_path = public, pg_temp;
    END IF;
    
    -- Credit wallet
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'credit_wallet') THEN
        ALTER FUNCTION public.credit_wallet SET search_path = public, pg_temp;
    END IF;
    
    -- Create atomic booking
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'create_atomic_booking') THEN
        ALTER FUNCTION public.create_atomic_booking SET search_path = public, pg_temp;
    END IF;
    
    -- Get active tax rate
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'get_active_tax_rate') THEN
        ALTER FUNCTION public.get_active_tax_rate SET search_path = public, pg_temp;
    END IF;
    
    -- Generate monthly invoices
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_monthly_invoices') THEN
        ALTER FUNCTION public.generate_monthly_invoices SET search_path = public, pg_temp;
    END IF;
    
    -- Update booking time range
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_booking_time_range') THEN
        ALTER FUNCTION public.update_booking_time_range SET search_path = public, pg_temp;
    END IF;
    
    -- Update updated_at column
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        ALTER FUNCTION public.update_updated_at_column SET search_path = public, pg_temp;
    END IF;
    
    -- Cancel booking
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'cancel_booking') THEN
        ALTER FUNCTION public.cancel_booking SET search_path = public, pg_temp;
    END IF;
    
    -- Calculate occupancy rate
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'calculate_occupancy_rate') THEN
        ALTER FUNCTION public.calculate_occupancy_rate SET search_path = public, pg_temp;
    END IF;
    
    -- Generate apple wallet pass
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_apple_wallet_pass') THEN
        ALTER FUNCTION public.generate_apple_wallet_pass SET search_path = public, pg_temp;
    END IF;
END $$;

-- ============================================================================
-- PART 4: MOVE BTREE_GIST EXTENSION TO EXTENSIONS SCHEMA
-- ============================================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move btree_gist extension (if it exists in public)
DO $$
BEGIN
    -- Check if extension exists in public schema
    IF EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname = 'btree_gist' 
        AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        -- Drop and recreate in extensions schema
        DROP EXTENSION IF EXISTS btree_gist CASCADE;
        CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;
    END IF;
END $$;

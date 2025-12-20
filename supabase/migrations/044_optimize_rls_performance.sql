-- Migration: Optimize Core RLS Policies (Minimal Safe Version)
-- Only optimizes the most important tables that definitely exist

-- ============================================================================
-- BOOKINGS - Most critical table
-- ============================================================================

DO $$ 
BEGIN
    -- Remove duplicate/overly broad policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Service role full access') THEN
        DROP POLICY "Service role full access" ON public.bookings;
    END IF;
    
    -- Optimize authenticated create
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Authenticated create') THEN
        DROP POLICY "Authenticated create" ON public.bookings;
        CREATE POLICY "Authenticated create" ON public.bookings
            FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');
    END IF;
    
    -- Optimize user update (check if user_id column exists first)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'user_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can update own') THEN
            DROP POLICY "Users can update own" ON public.bookings;
            CREATE POLICY "Users can update own" ON public.bookings
                FOR UPDATE USING ((SELECT auth.uid()) = user_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- COURTS - Remove duplicate policies
-- ============================================================================

DO $$ 
BEGIN
    -- Keep only one public read policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courts' AND policyname = 'Allow all') THEN
        DROP POLICY "Allow all" ON public.courts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courts' AND policyname = 'Public read courts') THEN
        DROP POLICY "Public read courts" ON public.courts;
    END IF;
    -- Keep "Public view courts" (most descriptive)
END $$;

-- ============================================================================
-- CLUBS - Optimize if exists
-- ============================================================================

DO $$ 
BEGIN
    -- Remove duplicate if exists
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clubs' AND policyname = 'Public read clubs') THEN
        -- This one doesn't use auth functions, so no optimization needed
        -- Just remove if there are duplicates
    END IF;
END $$;

-- ============================================================================
-- TAX_RATES - Optimize service role policy
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tax_rates' AND policyname = 'Service role can manage tax rates') THEN
        DROP POLICY "Service role can manage tax rates" ON public.tax_rates;
        CREATE POLICY "Service role can manage tax rates" ON public.tax_rates
            FOR ALL USING ((SELECT auth.role()) = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- LEDGER_ENTRIES - Optimize service role policy
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ledger_entries' AND policyname = 'Service role can manage ledger') THEN
        DROP POLICY "Service role can manage ledger" ON public.ledger_entries;
        CREATE POLICY "Service role can manage ledger" ON public.ledger_entries
            FOR ALL USING ((SELECT auth.role()) = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- PLAYER_RATINGS - Optimize if user_id exists
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'player_ratings' 
        AND column_name = 'user_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_ratings' AND policyname = 'Users can update own rating') THEN
            DROP POLICY "Users can update own rating" ON public.player_ratings;
            CREATE POLICY "Users can update own rating" ON public.player_ratings
                FOR UPDATE USING ((SELECT auth.uid()) = user_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TRANSACTIONS - Optimize if user_id exists
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions') THEN
            DROP POLICY "Users can view own transactions" ON public.transactions;
            CREATE POLICY "Users can view own transactions" ON public.transactions
                FOR SELECT USING ((SELECT auth.uid()) = user_id);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Service role can manage transactions') THEN
        DROP POLICY "Service role can manage transactions" ON public.transactions;
        CREATE POLICY "Service role can manage transactions" ON public.transactions
            FOR ALL USING ((SELECT auth.role()) = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- MATCHES - Optimize create policy
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Auth create matches') THEN
        DROP POLICY "Auth create matches" ON public.matches;
        CREATE POLICY "Auth create matches" ON public.matches
            FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');
    END IF;
END $$;

-- ============================================================================
-- BOOKING_SPLITS - Optimize if exists
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_splits' AND policyname = 'Users can view their booking splits') THEN
        DROP POLICY "Users can view their booking splits" ON public.booking_splits;
        CREATE POLICY "Users can view their booking splits" ON public.booking_splits
            FOR SELECT USING (
                (SELECT auth.uid()) IN (
                    SELECT user_id FROM public.bookings WHERE id = booking_id
                )
            );
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Core RLS policies optimized successfully!';
END $$;

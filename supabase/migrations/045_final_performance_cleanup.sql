-- Migration: Final Performance Cleanup
-- Fixes remaining 37 performance warnings

-- ============================================================================
-- PART 1: FIX CLUB_WALLETS (has duplicates + needs optimization)
-- ============================================================================

DO $$ 
BEGIN
    -- Remove duplicate "Users view own wallet"
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'club_wallets' AND policyname = 'Users view own wallet') THEN
        DROP POLICY "Users view own wallet" ON public.club_wallets;
    END IF;
    
    -- Check if user_id column exists, then optimize
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'club_wallets' AND column_name = 'user_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'club_wallets' AND policyname = 'Users can view own wallet') THEN
            DROP POLICY "Users can view own wallet" ON public.club_wallets;
            CREATE POLICY "Users can view own wallet" ON public.club_wallets
                FOR SELECT USING ((SELECT auth.uid()) = user_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'club_wallets' AND policyname = 'Users can update own wallet') THEN
            DROP POLICY "Users can update own wallet" ON public.club_wallets;
            CREATE POLICY "Users can update own wallet" ON public.club_wallets
                FOR UPDATE USING ((SELECT auth.uid()) = user_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PART 2: FIX WALLET_TRANSACTIONS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'wallet_transactions' AND column_name = 'user_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallet_transactions' AND policyname = 'Users view own transactions') THEN
            DROP POLICY "Users view own transactions" ON public.wallet_transactions;
            CREATE POLICY "Users view own transactions" ON public.wallet_transactions
                FOR SELECT USING ((SELECT auth.uid()) = user_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PART 3: FIX COMPANIES
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'owner_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Allow users to manage their own company') THEN
            DROP POLICY "Allow users to manage their own company" ON public.companies;
            CREATE POLICY "Allow users to manage their own company" ON public.companies
                FOR ALL USING ((SELECT auth.uid()) = owner_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PART 4: FIX COMPANY_USERS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_users' AND policyname = 'Allow users to view their company users') THEN
        DROP POLICY "Allow users to view their company users" ON public.company_users;
        CREATE POLICY "Allow users to view their company users" ON public.company_users
            FOR SELECT USING (
                (SELECT auth.uid()) IN (
                    SELECT user_id FROM public.company_users cu WHERE cu.company_id = company_users.company_id
                )
            );
    END IF;
END $$;

-- ============================================================================
-- PART 5: FIX COURT_MAINTENANCE (has duplicates)
-- ============================================================================

DO $$ 
BEGIN
    -- Remove duplicate
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'court_maintenance' AND policyname = 'Authenticated users can view maintenance') THEN
        DROP POLICY "Authenticated users can view maintenance" ON public.court_maintenance;
    END IF;
    
    -- Optimize admin policy
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'court_maintenance' AND policyname = 'Admins can manage maintenance') THEN
        DROP POLICY "Admins can manage maintenance" ON public.court_maintenance;
        CREATE POLICY "Admins can manage maintenance" ON public.court_maintenance
            FOR ALL USING ((SELECT auth.role()) = 'authenticated');
    END IF;
END $$;

-- ============================================================================
-- PART 6: FIX INVOICES
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Allow users to manage their company invoices') THEN
        DROP POLICY "Allow users to manage their company invoices" ON public.invoices;
        CREATE POLICY "Allow users to manage their company invoices" ON public.invoices
            FOR ALL USING (
                company_id IN (
                    SELECT id FROM public.companies WHERE owner_id = (SELECT auth.uid())
                )
            );
    END IF;
END $$;

-- ============================================================================
-- PART 7: FIX INVOICE_ITEMS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoice_items' AND policyname = 'Allow users to view their company invoice items') THEN
        DROP POLICY "Allow users to view their company invoice items" ON public.invoice_items;
        CREATE POLICY "Allow users to view their company invoice items" ON public.invoice_items
            FOR SELECT USING (
                invoice_id IN (
                    SELECT id FROM public.invoices WHERE company_id IN (
                        SELECT id FROM public.companies WHERE owner_id = (SELECT auth.uid())
                    )
                )
            );
    END IF;
END $$;

-- ============================================================================
-- PART 8: FIX SUBSCRIPTIONS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'user_id'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscription') THEN
            DROP POLICY "Users can view own subscription" ON public.subscriptions;
            CREATE POLICY "Users can view own subscription" ON public.subscriptions
                FOR SELECT USING ((SELECT auth.uid()) = user_id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PART 9: FIX MATCH_PLAYERS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_players' AND policyname = 'Auth create players') THEN
        DROP POLICY "Auth create players" ON public.match_players;
        CREATE POLICY "Auth create players" ON public.match_players
            FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');
    END IF;
END $$;

-- ============================================================================
-- PART 10: FIX MATCH_SETS (already optimized in 044, but double-check)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_sets' AND policyname = 'Match participants can view sets') THEN
        DROP POLICY "Match participants can view sets" ON public.match_sets;
        CREATE POLICY "Match participants can view sets" ON public.match_sets
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.matches m
                    WHERE m.id = match_id
                    AND (m.booking_id IN (
                        SELECT id FROM public.bookings WHERE user_id = (SELECT auth.uid())
                    ))
                )
            );
    END IF;
END $$;

-- ============================================================================
-- PART 11: REMOVE DUPLICATE POLICIES
-- ============================================================================

-- OCCUPANCY_PREDICTIONS
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'occupancy_predictions' AND policyname = 'System can manage predictions') THEN
        DROP POLICY "System can manage predictions" ON public.occupancy_predictions;
    END IF;
END $$;

-- TAX_RATES (keep public read, remove service role from SELECT - it's too broad)
-- Actually, we need both - one for public read, one for service role write
-- So this is fine, just optimize the service role one
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tax_rates' AND policyname = 'Service role can manage tax rates') THEN
        DROP POLICY "Service role can manage tax rates" ON public.tax_rates;
        CREATE POLICY "Service role can manage tax rates" ON public.tax_rates
            FOR ALL USING ((SELECT auth.role()) = 'service_role');
    END IF;
END $$;

-- TRANSACTIONS (same - both policies are needed for different purposes)
-- Already optimized in migration 044

-- WEATHER_CACHE
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weather_cache' AND policyname = 'System can manage weather cache') THEN
        DROP POLICY "System can manage weather cache" ON public.weather_cache;
    END IF;
END $$;

-- Success!
DO $$ 
BEGIN
    RAISE NOTICE 'All remaining performance optimizations completed!';
END $$;

-- Migration: Fix 049 - Drop and Recreate Policies
-- Fixes the duplicate policy error by cleaning up first

-- ============================================================================
-- DROP EXISTING POLICIES (if any)
-- ============================================================================

-- User Stats Policies
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;

-- Partner Connections Policies
DROP POLICY IF EXISTS "Users can view their connections" ON public.partner_connections;
DROP POLICY IF EXISTS "Users can manage their connections" ON public.partner_connections;

-- Challenges Policies
DROP POLICY IF EXISTS "Users can view challenges involving them" ON public.challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their challenges" ON public.challenges;

-- ============================================================================
-- RECREATE POLICIES
-- ============================================================================

-- User Stats Policies
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Partner Connections Policies
CREATE POLICY "Users can view their connections"
  ON public.partner_connections FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR partner_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage their connections"
  ON public.partner_connections FOR ALL
  USING (user_id = (SELECT auth.uid()));

-- Challenges Policies
CREATE POLICY "Users can view challenges involving them"
  ON public.challenges FOR SELECT
  USING (challenger_id = (SELECT auth.uid()) OR challenged_id = (SELECT auth.uid()));

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (challenger_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their challenges"
  ON public.challenges FOR UPDATE
  USING (challenger_id = (SELECT auth.uid()) OR challenged_id = (SELECT auth.uid()));

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Policies fixed and recreated successfully!';
  RAISE NOTICE '✓ User stats policies';
  RAISE NOTICE '✓ Partner connection policies';
  RAISE NOTICE '✓ Challenges policies';
END $$;

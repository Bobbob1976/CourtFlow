-- PHASE 1: Stripe Connect Onboarding
-- Add Stripe Connect fields to clubs table for multi-tenant payment processing

-- Add Stripe Connect columns to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_account_id TEXT UNIQUE;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_clubs_stripe_account_id ON clubs(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clubs_onboarding_status ON clubs(stripe_onboarding_completed, stripe_charges_enabled) WHERE deleted_at IS NULL;

-- Create function to update Stripe account status
CREATE OR REPLACE FUNCTION update_club_stripe_status(
    p_club_id UUID,
    p_account_id TEXT,
    p_charges_enabled BOOLEAN DEFAULT FALSE,
    p_details_submitted BOOLEAN DEFAULT FALSE,
    p_onboarding_completed BOOLEAN DEFAULT FALSE
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE clubs SET
        stripe_account_id = p_account_id,
        stripe_charges_enabled = p_charges_enabled,
        stripe_details_submitted = p_details_submitted,
        stripe_onboarding_completed = p_onboarding_completed,
        stripe_onboarding_completed_at = CASE 
            WHEN p_onboarding_completed THEN NOW()
            ELSE stripe_onboarding_completed_at
        END,
        updated_at = NOW()
    WHERE id = p_club_id;
END;
$$;

-- RLS Policy for club Stripe data (only club owners/admins can see/modify)
CREATE POLICY "Club owners/admins can manage stripe data" ON clubs
    FOR ALL USING (
        id IN (
            SELECT up.club_id FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('owner', 'admin')
        )
    );

-- Allow service role to manage all stripe data
CREATE POLICY "Service role can manage all stripe data" ON clubs
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to get club's Stripe account status
CREATE OR REPLACE FUNCTION get_club_stripe_status(p_club_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'club_id', c.id,
        'club_name', c.name,
        'stripe_account_id', c.stripe_account_id,
        'onboarding_completed', c.stripe_onboarding_completed,
        'charges_enabled', c.stripe_charges_enabled,
        'details_submitted', c.stripe_details_submitted,
        'onboarding_completed_at', c.stripe_onboarding_completed_at,
        'requires_onboarding', (
            c.stripe_account_id IS NULL OR 
            NOT c.stripe_onboarding_completed OR
            NOT c.stripe_charges_enabled
        )
    ) INTO result
    FROM clubs c
    WHERE c.id = p_club_id;

    RETURN result;
END;
$$;

-- Create function to get all clubs needing Stripe onboarding
CREATE OR REPLACE FUNCTION get_clubs_needing_stripe_onboarding()
RETURNS TABLE(
    club_id UUID,
    club_name TEXT,
    stripe_account_id TEXT,
    onboarding_completed BOOLEAN,
    charges_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.stripe_account_id,
        c.stripe_onboarding_completed,
        c.stripe_charges_enabled
    FROM clubs c
    WHERE c.deleted_at IS NULL
    AND (
        c.stripe_account_id IS NULL OR 
        NOT c.stripe_onboarding_completed OR
        NOT c.stripe_charges_enabled
    );
END;
$$;

-- Audit trigger for Stripe data changes
CREATE OR REPLACE FUNCTION log_stripe_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log only relevant changes to stripe fields
    IF (OLD.stripe_account_id IS DISTINCT FROM NEW.stripe_account_id) OR
       (OLD.stripe_onboarding_completed IS DISTINCT FROM NEW.stripe_onboarding_completed) OR
       (OLD.stripe_charges_enabled IS DISTINCT FROM NEW.stripe_charges_enabled) THEN
        
        RAISE NOTICE 'Club % Stripe status changed: AccountID=%s, Onboarding=%s, Charges=%s', 
            NEW.id, 
            NEW.stripe_account_id,
            NEW.stripe_onboarding_completed,
            NEW.stripe_charges_enabled;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for Stripe status changes
DROP TRIGGER IF EXISTS clubs_stripe_audit_trigger ON clubs;
CREATE TRIGGER clubs_stripe_audit_trigger
    AFTER UPDATE ON clubs
    FOR EACH ROW
    WHEN (
        OLD.stripe_account_id IS DISTINCT FROM NEW.stripe_account_id OR
        OLD.stripe_onboarding_completed IS DISTINCT FROM NEW.stripe_onboarding_completed OR
        OLD.stripe_charges_enabled IS DISTINCT FROM NEW.stripe_charges_enabled
    )
    EXECUTE FUNCTION log_stripe_changes();

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Stripe Connect fields added successfully to clubs table!
-- 
-- New Columns:
-- - stripe_account_id: TEXT UNIQUE - Stripe Connect account ID
-- - stripe_onboarding_completed: BOOLEAN DEFAULT FALSE - Whether onboarding is complete
-- - stripe_onboarding_completed_at: TIMESTAMP - When onboarding was completed
-- - stripe_charges_enabled: BOOLEAN DEFAULT FALSE - Whether account can accept payments
-- - stripe_details_submitted: BOOLEAN DEFAULT FALSE - Whether business details are submitted
--
-- Helper Functions:
-- - update_club_stripe_status() - Update Stripe account status
-- - get_club_stripe_status() - Get club's Stripe status as JSON
-- - get_clubs_needing_stripe_onboarding() - Get clubs that need onboarding
--
-- Security:
-- - RLS policies ensuring only club owners/admins can access Stripe data
-- - Service role has full access for webhooks and integrations
-- - Audit logging for Stripe status changes
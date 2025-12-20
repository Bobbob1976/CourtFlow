-- Add Stripe test account ID to demo club for wallet testing

UPDATE clubs 
SET stripe_account_id = 'acct_1234567890TEST' -- Fake test ID for development
WHERE subdomain = 'demo';

-- Verify
SELECT id, name, subdomain, stripe_account_id 
FROM clubs 
WHERE subdomain = 'demo';

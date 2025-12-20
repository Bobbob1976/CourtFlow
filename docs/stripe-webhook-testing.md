# PHASE 1: Stripe CLI Webhook Testing Guide

## 📋 Overview

This guide explains how to test Stripe webhooks locally during development. Since webhooks can't be received on localhost directly, we use the Stripe CLI to forward webhook events to your local development server.

## 🚀 Setup Instructions

### 1. Install Stripe CLI

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

**Linux:**

```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### 2. Login to Stripe CLI

```bash
stripe login
```

This will open a browser to authenticate with your Stripe account.

### 3. Configure Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `http://localhost:3000/api/stripe/webhook`
4. Select events to listen for:
   - `account.updated` ⭐ (most important)
   - `account.application.deauthorized`
   - `charge.succeeded`
   - `payment_intent.succeeded`
5. Click "Add endpoint"

### 4. Start Local Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Your server should be running on `http://localhost:3000`

### 5. Forward Webhooks to Local Server

Open a new terminal and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will display a webhook signing secret like `whsec_...`

### 6. Set Environment Variable

Add the webhook secret to your `.env.local` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🧪 Testing Webhooks

### Simulate account.updated Event

After completing Stripe onboarding, test the webhook:

```bash
stripe trigger account.updated
```

### Simulate Successful Payment

```bash
stripe trigger payment_intent.succeeded
```

### Check Webhook Logs

View real-time webhook delivery logs:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --events-to-log
```

## 🔍 Testing the Complete Flow

1. **Create Stripe Account:**

   ```bash
   # Trigger through your UI
   # Or manually:
   stripe trigger account.updated
   ```

2. **Monitor Database Changes:**

   - Check your Supabase dashboard
   - Look for `stripe_onboarding_completed` changing to `true`
   - Verify `stripe_charges_enabled` and `stripe_details_submitted`

3. **Test Account Status Verification:**
   - Use the "Refresh" button in your UI
   - This calls `verifyStripeAccountStatus()` function
   - Should update the database with latest Stripe API status

## 🐛 Troubleshooting

### Common Issues

**Webhook not being received:**

```bash
# Check if Stripe CLI is running
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook endpoint directly
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "account.updated", "data": {"object": {}}}'
```

**Environment variable not found:**

```bash
# Verify .env.local exists and contains:
STRIPE_WEBHOOK_SECRET=whsec_...

# Restart your development server after adding environment variables
```

**Database not updating:**

```bash
# Check Supabase logs
# Verify RLS policies allow updates
# Check webhook handler logs in your terminal
```

### Useful Stripe CLI Commands

```bash
# List available events to trigger
stripe trigger --help

# Simulate specific account status
stripe trigger account.updated --account acct_123456789

# View webhook delivery history
stripe events list --limit 10

# Get specific event details
stripe events retrieve evt_123456789
```

## 🔧 Advanced Testing

### Testing with Different Account States

```bash
# Test partially completed account
stripe trigger account.updated \
  --account acct_test123 \
  --data account[charges_enabled]=false \
  --data account[details_submitted]=true

# Test fully completed account
stripe trigger account.updated \
  --account acct_test123 \
  --data account[charges_enabled]=true \
  --data account[details_submitted]=true
```

### Manual Database Updates (for testing)

If webhooks aren't working, you can manually test the database functions:

```sql
-- Manually update club status for testing
UPDATE clubs
SET
  stripe_onboarding_completed = true,
  stripe_charges_enabled = true,
  stripe_details_submitted = true,
  stripe_onboarding_completed_at = NOW()
WHERE id = 'your-club-uuid';
```

## 📝 Production Deployment Notes

### Production Environment Variables

Ensure these are set in your production environment:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Webhook Endpoint URL

For production, update your Stripe webhook endpoint to:

```
https://your-domain.com/api/stripe/webhook
```

### Monitoring Webhook Delivery

In Stripe Dashboard → Developers → Webhooks:

- Monitor delivery success/failure rates
- Check individual webhook attempt details
- Set up alerts for failed deliveries

## ✅ Testing Checklist

- [ ] Stripe CLI installed and authenticated
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Local development server running on port 3000
- [ ] Stripe CLI forwarding webhooks to local server
- [ ] `STRIPE_WEBHOOK_SECRET` set in `.env.local`
- [ ] Test `account.updated` webhook event
- [ ] Verify database status updates correctly
- [ ] Test manual "Refresh" button functionality
- [ ] Check webhook logs for any errors
- [ ] Test complete onboarding flow end-to-end

## 🚨 Important Notes

1. **Webhook Security:** Always verify webhook signatures in production
2. **Idempotency:** Webhooks may be retried, ensure your handler is idempotent
3. **Rate Limits:** Stripe has rate limits for webhook delivery
4. **Testing:** Always test in Stripe test mode before going live
5. **Monitoring:** Set up monitoring for webhook failures in production

With these steps, you can fully test the Stripe Connect onboarding flow locally without relying on external webhook delivery!

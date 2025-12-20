# 🚀 COURTFLOW - PRODUCTION DEPLOYMENT GUIDE

## 📋 PRE-DEPLOYMENT CHECKLIST

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Git repository clean

### Accounts Setup
- [ ] Supabase production project created
- [ ] Vercel account ready
- [ ] Mollie production account (optional)
- [ ] Resend account (optional)
- [ ] Custom domain purchased (optional)

---

## 🗄️ STEP 1: SUPABASE PRODUCTION SETUP

### 1.1 Create Production Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: CourtFlow Production
   - **Database Password**: (save securely!)
   - **Region**: Choose closest to users
4. Wait for project creation (~2 minutes)

### 1.2 Run Database Migrations

1. Open SQL Editor in Supabase dashboard
2. Run migrations **in this exact order**:

```sql
-- Migration 1: Admin Intelligence
-- Copy/paste: 040_admin_intelligence_schema.sql
-- Click "Run"
-- ✅ Verify: Tables created (court_occupancy_history, weather_cache, etc.)

-- Migration 2: Populate History
-- Copy/paste: 041_populate_occupancy_history.sql
-- Click "Run"
-- ✅ Verify: Function created

-- Migration 3: Refunds
-- Copy/paste: 042_create_refunds_table.sql
-- Click "Run"
-- ✅ Verify: refunds table created

-- Migration 4: Memberships
-- Copy/paste: 043_membership_system.sql
-- Click "Run"
-- ✅ Verify: 3 membership tiers inserted

-- Migration 5: Loyalty Points
-- Copy/paste: 044_loyalty_points_system.sql
-- Click "Run"
-- ✅ Verify: 5 rewards in catalog

-- Migration 6: Promotions
-- Copy/paste: 045_promotions_system.sql
-- Click "Run"
-- ✅ Verify: 4 promo codes created
```

### 1.3 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure **Email Templates**:
   - Customize confirmation email
   - Add your branding
4. Set **Site URL**: `https://your-domain.com`
5. Add **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for dev)

### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep secret!)

---

## ☁️ STEP 2: VERCEL DEPLOYMENT

### 2.1 Prepare Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Production ready deployment"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/courtflow.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.3 Environment Variables

Click "Environment Variables" and add:

#### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Optional Variables
```env
# Mollie (for payments)
MOLLIE_API_KEY=live_xxx

# Resend (for emails)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@your-domain.com
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. ✅ Deployment successful!
4. Visit your URL: `https://your-project.vercel.app`

---

## 💳 STEP 3: MOLLIE PRODUCTION SETUP

### 3.1 Create Mollie Account

1. Go to https://www.mollie.com
2. Sign up for business account
3. Complete verification (KYC)
4. Wait for approval (~1-2 days)

### 3.2 Get Live API Key

1. Go to **Developers** → **API Keys**
2. Switch to **Live mode**
3. Copy **Live API Key**
4. Add to Vercel environment variables

### 3.3 Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Add webhook URL:
   ```
   https://your-domain.vercel.app/api/webhooks/mollie
   ```
3. Select events:
   - `payment.paid`
   - `payment.failed`
   - `payment.refunded`

---

## 📧 STEP 4: EMAIL SETUP (OPTIONAL)

### 4.1 Resend Setup

1. Go to https://resend.com
2. Create account
3. Verify your domain:
   - Add DNS records
   - Wait for verification
4. Get API key
5. Add to Vercel environment variables

### 4.2 Test Email

```bash
# In your local environment
curl -X POST https://your-domain.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## 🌐 STEP 5: CUSTOM DOMAIN (OPTIONAL)

### 5.1 Add Domain to Vercel

1. In Vercel project settings
2. Go to **Domains**
3. Add your domain: `courtflow.app`
4. Follow DNS configuration instructions

### 5.2 Configure DNS

Add these records to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 SSL Certificate

- Vercel automatically provisions SSL
- Wait ~24 hours for propagation
- ✅ HTTPS enabled automatically

---

## 🔒 STEP 6: SECURITY CHECKLIST

### Production Security

- [ ] Environment variables secured
- [ ] Service role key never exposed to client
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled (optional)
- [ ] Webhook signatures verified

### Supabase Security

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show rowsecurity = true
```

---

## 📊 STEP 7: MONITORING SETUP

### 7.1 Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 7.2 Error Tracking (Optional)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 7.3 Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🧪 STEP 8: POST-DEPLOYMENT TESTING

### Critical Tests

1. **Homepage loads**: `https://your-domain.com`
2. **Booking flow works**: Create test booking
3. **Payment processes**: Complete test payment
4. **Admin dashboard**: Check `/admin/dashboard`
5. **Email sends**: Verify confirmation emails
6. **Mobile responsive**: Test on phone

### Test Checklist

```bash
# Test booking flow
curl https://your-domain.com/api/admin/courts/status?clubId=xxx

# Test forecast API
curl https://your-domain.com/api/admin/forecast?clubId=xxx

# Check health
curl https://your-domain.com/api/health
```

---

## 🔄 STEP 9: CONTINUOUS DEPLOYMENT

### Auto-Deploy Setup

Vercel automatically deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview

### Deployment Workflow

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Builds project
# 2. Runs tests
# 3. Deploys to production
# 4. Notifies you
```

---

## 📈 STEP 10: SCALING CONSIDERATIONS

### Database Scaling

- **Supabase Pro**: Upgrade for more connections
- **Connection Pooler**: Use for high traffic
- **Read Replicas**: For read-heavy workloads

### Application Scaling

- **Vercel Pro**: Unlimited bandwidth
- **Edge Functions**: Deploy globally
- **CDN**: Automatic with Vercel

### Cost Estimates

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| Supabase | 500MB DB, 2GB bandwidth | $25/mo (Pro) |
| Vercel | 100GB bandwidth | $20/mo (Pro) |
| Mollie | No monthly fee | 1.29% + €0.25 per transaction |
| Resend | 3,000 emails/mo | $20/mo (10k emails) |

---

## 🚨 TROUBLESHOOTING

### Build Fails

```bash
# Check build logs in Vercel
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies

# Fix locally first:
npm run build
```

### Database Connection Issues

```bash
# Check Supabase status
# Verify connection pooler URL
# Check RLS policies
```

### Payment Webhook Not Working

```bash
# Verify webhook URL in Mollie dashboard
# Check webhook logs
# Test with Mollie test mode first
```

---

## ✅ DEPLOYMENT COMPLETE!

### Final Checklist

- [ ] Production database running
- [ ] Application deployed to Vercel
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Payment processing tested
- [ ] Email sending verified
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Team access granted

### Next Steps

1. **Monitor**: Check analytics daily
2. **Optimize**: Review performance metrics
3. **Market**: Launch marketing campaign
4. **Support**: Set up customer support
5. **Iterate**: Gather feedback and improve

---

## 🎉 CONGRATULATIONS!

Your CourtFlow platform is now **LIVE IN PRODUCTION**! 🚀

### Support Resources

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Mollie Support**: https://help.mollie.com

### Maintenance Schedule

- **Daily**: Monitor errors and performance
- **Weekly**: Review analytics and user feedback
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Feature updates and improvements

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Production URL**: _____________
**Status**: 🟢 LIVE

---

**Good luck with your launch!** 🎾🚀

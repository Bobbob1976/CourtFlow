# 📚 COURTFLOW - COMPLETE DOCUMENTATION

## 📖 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Component Library](#component-library)
5. [Business Logic](#business-logic)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Mollie
- **Email**: Resend
- **Weather**: Open-Meteo (Free)
- **Styling**: Tailwind CSS

### Project Structure
```
courtflow/
├── app/                    # Next.js app router
│   ├── (club)/            # Club-specific routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── membership/        # Membership pages
│   └── loyalty/           # Loyalty rewards
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── booking/          # Booking components
│   └── ...
├── lib/                   # Utility functions
│   ├── mollie-actions.ts # Payment logic
│   ├── email-service.ts  # Email sending
│   └── ...
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

#### `clubs`
- Club information and settings
- Fields: `id`, `name`, `subdomain`, `settings`

#### `courts`
- Court details and availability
- Fields: `id`, `club_id`, `name`, `sport`, `hourly_rate`

#### `bookings`
- Court reservations
- Fields: `id`, `user_id`, `court_id`, `booking_date`, `start_time`, `end_time`, `total_cost`, `payment_status`

#### `user_profiles`
- Extended user information
- Fields: `id`, `full_name`, `email`, `club_id`

### Intelligence Tables

#### `court_occupancy_history`
- Historical occupancy data for ML
- Fields: `club_id`, `court_id`, `date`, `hour`, `occupancy_rate`, `total_bookings`

#### `occupancy_predictions`
- AI-generated forecasts
- Fields: `club_id`, `prediction_date`, `hour`, `predicted_occupancy`, `confidence_level`

#### `weather_cache`
- Cached weather data
- Fields: `location`, `date`, `hour`, `condition`, `temperature`

### Payment Tables

#### `refunds`
- Refund tracking
- Fields: `booking_id`, `user_id`, `amount`, `status`, `mollie_refund_id`

### Business Tables

#### `membership_tiers`
- Membership plan definitions
- Fields: `club_id`, `name`, `price_monthly`, `price_yearly`, `benefits`, `discount_percentage`

#### `user_memberships`
- User subscription status
- Fields: `user_id`, `tier_id`, `status`, `billing_cycle`, `next_billing_date`

#### `loyalty_points`
- Points balance and tier
- Fields: `user_id`, `club_id`, `balance`, `lifetime_earned`, `tier`

#### `points_transactions`
- Points earning/spending history
- Fields: `user_id`, `points`, `type`, `description`

#### `rewards_catalog`
- Available rewards
- Fields: `club_id`, `name`, `points_cost`, `reward_type`, `reward_value`

#### `promotions`
- Discount codes
- Fields: `club_id`, `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`

### Database Functions

#### `award_points(user_id, club_id, points, type, description)`
Awards loyalty points to a user

#### `spend_points(user_id, club_id, points, reward_id)`
Redeems points for rewards

#### `apply_promotion(code, club_id, user_id, amount, date, hour)`
Validates and applies promotion codes

#### `get_membership_discount(user_id, club_id)`
Returns user's membership discount percentage

---

## 🔌 API ENDPOINTS

### Admin Endpoints

#### `GET /api/admin/forecast?clubId={id}`
Returns AI-powered occupancy forecast
- **Response**: `{ predictedOccupancy, confidence, recommendation, weatherCondition }`

#### `GET /api/admin/courts/status?clubId={id}`
Returns real-time court status
- **Response**: `{ courts: [{ id, name, status, booking, maintenance }] }`

### Webhook Endpoints

#### `POST /api/webhooks/mollie`
Processes Mollie payment webhooks
- **Body**: `{ id: paymentId }`
- **Response**: `{ success: boolean }`

---

## 🧩 COMPONENT LIBRARY

### Admin Components

#### `SmartForecastWidget`
```tsx
<SmartForecastWidget clubId="..." />
```
Displays AI forecast with weather and recommendations

#### `VisualCourtGrid`
```tsx
<VisualCourtGrid clubId="..." />
```
Real-time court status grid with countdown timers

#### `RefundModal`
```tsx
<RefundModal 
  isOpen={true}
  booking={booking}
  onClose={() => {}}
  onSuccess={() => {}}
/>
```
Refund processing modal

### User Components

#### `MobileBottomNav`
```tsx
<MobileBottomNav clubId="demo" />
```
Mobile navigation bar (auto-hidden on desktop)

#### `MobileBookingCard`
```tsx
<MobileBookingCard 
  booking={booking}
  onCancel={(id) => {}}
  onExtend={(id) => {}}
/>
```
Touch-optimized booking card

#### `SwipeableCourtSelector`
```tsx
<SwipeableCourtSelector
  courts={courts}
  selectedCourtId={id}
  onSelectCourt={(id) => {}}
/>
```
Swipeable court picker for mobile

#### `NotificationContainer`
```tsx
<NotificationContainer />
// Usage:
import { notify } from '@/components/NotificationContainer';
notify.success('Success!', 'Booking confirmed');
```
Toast notification system

---

## 💼 BUSINESS LOGIC

### Booking Flow
1. User selects court + time
2. System checks availability
3. User confirms booking
4. Payment created (Mollie or dev mode)
5. Booking confirmed
6. Email sent
7. Points awarded

### Membership Discounts
```typescript
// Automatic discount application
const discount = await get_membership_discount(userId, clubId);
const finalPrice = bookingPrice * (1 - discount / 100);
```

### Loyalty Points Earning
- **Bookings**: 10 points per €1 spent
- **Referrals**: 500 points
- **Reviews**: 50 points
- **Birthday**: 100 points

### Tier Progression
- **Bronze**: 0-1,999 points
- **Silver**: 2,000-4,999 points
- **Gold**: 5,000-9,999 points
- **Platinum**: 10,000+ points

### Promotion Validation
```typescript
const result = await apply_promotion(
  code,
  clubId,
  userId,
  bookingAmount,
  bookingDate,
  bookingHour
);
// Returns: { valid, discount_amount, error_message }
```

---

## ⚙️ CONFIGURATION

### Environment Variables

#### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Optional (Development)
```env
MOLLIE_API_KEY=test_xxx  # For payment testing
RESEND_API_KEY=re_xxx    # For email sending
EMAIL_FROM=noreply@courtflow.app
```

#### Optional (Production)
```env
MOLLIE_API_KEY=live_xxx
OPENWEATHER_API_KEY=xxx  # If using OpenWeather instead of Open-Meteo
```

### Supabase Configuration

#### RLS Policies
All tables have Row Level Security enabled:
- Users can only view/edit their own data
- Admins have full access (via service role)
- Public data (courts, tiers) readable by all

#### Indexes
Performance indexes on:
- `bookings(user_id, booking_date)`
- `loyalty_points(user_id, club_id)`
- `promotions(code, club_id)`
- All foreign keys

---

## 🚀 DEPLOYMENT

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Connect to Vercel**
- Go to vercel.com
- Import repository
- Configure environment variables
- Deploy

3. **Post-Deployment**
- Run migrations in production Supabase
- Test payment flow
- Configure custom domain

### Database Migration

```sql
-- Run in Supabase SQL Editor (Production)
-- Copy/paste each migration file in order
040_admin_intelligence_schema.sql
041_populate_occupancy_history.sql
042_create_refunds_table.sql
043_membership_system.sql
044_loyalty_points_system.sql
045_promotions_system.sql
```

### Environment Setup

1. **Supabase Project**
- Create production project
- Copy URL and keys
- Enable email auth

2. **Mollie Account**
- Create account
- Get live API key
- Configure webhooks

3. **Resend Account** (Optional)
- Create account
- Get API key
- Verify domain

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### "Cannot coerce result to single JSON object"
**Cause**: Query expects single row but got 0 or multiple
**Fix**: Add `.single()` only when expecting exactly 1 row

#### "JSON parse error" in dev server
**Cause**: Corrupted Next.js cache
**Fix**: 
```bash
rm -rf .next
npm run dev
```

#### Mollie webhook not working
**Cause**: Localhost not reachable from internet
**Fix**: Use ngrok or deploy to staging

#### Weather API not loading
**Cause**: Network issue or rate limit
**Fix**: Check console logs, fallback to mock data works automatically

#### Points not updating
**Cause**: RLS policy blocking update
**Fix**: Use `award_points()` function, not direct INSERT

---

## 📞 SUPPORT

### Resources
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Mollie API**: https://docs.mollie.com
- **Open-Meteo**: https://open-meteo.com/en/docs

### Contact
- **Email**: support@courtflow.app
- **GitHub**: github.com/courtflow/courtflow

---

**Last Updated**: December 2025
**Version**: 2.0.0

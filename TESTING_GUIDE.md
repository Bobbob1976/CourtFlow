# 🧪 COURTFLOW - TESTING GUIDE

## 📋 PRE-TEST CHECKLIST

### 1. Database Setup
- [ ] Run all migrations in Supabase SQL Editor (in order):
  - `040_admin_intelligence_schema.sql`
  - `041_populate_occupancy_history.sql`
  - `042_create_refunds_table.sql`
  - `043_membership_system.sql`
  - `044_loyalty_points_system.sql`
  - `045_promotions_system.sql`

### 2. Environment Variables
- [ ] `.env.local` configured with:
  - `MOLLIE_API_KEY` (optional for dev mode)
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - `RESEND_API_KEY` (optional)

### 3. Server Running
- [ ] `npm run dev` running without errors
- [ ] Navigate to `http://localhost:3000`

---

## 🎯 FEATURE TESTING PLAN

### A. ADMIN INTELLIGENCE & FORECASTING

#### Test 1: Smart Forecast Widget
1. Navigate to `/admin/dashboard`
2. **Expected**: See Smart Forecast Widget with:
   - Predicted occupancy percentage
   - Confidence level (60-95%)
   - Weather conditions
   - Temperature
   - Actionable recommendation
3. **Verify**: Refresh page - forecast should cache (same data)

#### Test 2: Visual Court Grid
1. Stay on `/admin/dashboard`
2. **Expected**: See Visual Court Grid showing:
   - All courts with status colors:
     - 🟢 Green = Available
     - 🔵 Blue = Occupied (with countdown)
     - 🔴 Red = Maintenance
     - 🟡 Yellow = Payment Pending
3. **Verify**: Grid updates every 30 seconds

#### Test 3: Weather Integration
1. Navigate to `/admin/forecast-test`
2. **Expected**: See current weather data:
   - Condition (sunny/cloudy/rainy)
   - Temperature in °C
   - Precipitation
   - Wind speed
3. **Verify**: Data comes from Open-Meteo API (check console logs)

#### Test 4: Historical Data
1. Navigate to `/admin/data-management`
2. Click "Run Backfill" (select 90 days)
3. **Expected**: 
   - Success message
   - Historical records count increases
   - Recent data preview shows bookings
4. **Verify**: Check Supabase `court_occupancy_history` table

---

### B. PAYMENT FLOW

#### Test 5: Booking Payment (Development Mode)
1. Navigate to club booking page (e.g., `/demo`)
2. Select a court and time slot
3. Click "Book & Pay"
4. **Expected** (if `MOLLIE_API_KEY` not set):
   - Direct booking creation
   - Redirect to dashboard
   - Booking status = "pending"
5. **Expected** (if `MOLLIE_API_KEY` set):
   - Redirect to Mollie checkout
   - Complete payment
   - Redirect to success page
   - Booking status = "paid"

#### Test 6: Payment Tracking
1. Navigate to `/admin/payments`
2. **Expected**: See payments table with:
   - All bookings listed
   - Payment status (paid/pending)
   - Total revenue stats
   - Success rate percentage
3. **Verify**: Stats match actual data

#### Test 7: Refund System
1. On `/admin/payments`, find a paid booking
2. Click refund button
3. Enter reason (optional)
4. Click "Confirm Refund"
5. **Expected**:
   - Success notification
   - Booking status → "refunded"
   - Refund record created
6. **Verify**: Check Supabase `refunds` table

---

### C. USER EXPERIENCE

#### Test 8: Mobile Responsive
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Navigate through:
   - `/dashboard`
   - `/membership`
   - `/loyalty`
5. **Expected**:
   - Mobile bottom navigation visible
   - Touch-friendly buttons
   - Proper spacing
   - No horizontal scroll

#### Test 9: Notifications
1. Trigger any action (e.g., book a court)
2. **Expected**:
   - Toast notification appears (top-right)
   - Auto-dismisses after 5 seconds
   - Can manually close with X button
3. **Test different types**:
   - Success (green)
   - Error (red)
   - Warning (yellow)
   - Info (blue)

#### Test 10: Email Confirmations
1. Complete a booking
2. **Expected** (if `RESEND_API_KEY` set):
   - Email sent to user
   - Beautiful HTML template
   - Booking details included
3. **Expected** (if no API key):
   - Console log: "Email would be sent"

---

### D. BUSINESS FEATURES

#### Test 11: Membership System
1. Navigate to `/membership`
2. **Expected**: See 3 membership tiers:
   - Basic (€29.99/month)
   - Premium (€49.99/month) - Featured
   - VIP (€99.99/month)
3. Click "Get Started" on any tier
4. **Expected**: Redirect to subscribe page

#### Test 12: Loyalty Points
1. Navigate to `/loyalty`
2. **Expected**: See:
   - Points balance (0 if new user)
   - Current tier (Bronze)
   - Progress to next tier
   - Rewards catalog
   - Recent activity
3. **Manual Test**: Award points via SQL:
   ```sql
   SELECT award_points(
     'YOUR_USER_ID',
     '90f93d47-b438-427c-8b33-0597817c1d96',
     500,
     'booking',
     'Test booking'
   );
   ```
4. Refresh page
5. **Expected**: Balance updated to 500 points

#### Test 13: Promotions
1. Create a booking
2. Enter promo code: `WELCOME10`
3. **Expected**:
   - 10% discount applied
   - Total cost reduced
4. **Test other codes**:
   - `WEEKEND25` (only weekends)
   - `EARLYBIRD` (only 6-10 AM)
   - `FLASH50` (50% off, limited uses)

---

## 🔍 EDGE CASE TESTING

### Test 14: Concurrent Bookings
1. Open 2 browser windows
2. Both select same court/time
3. Both click "Book"
4. **Expected**: Only one succeeds, other gets error

### Test 15: Expired Promotions
1. Try using a promo code after `valid_until` date
2. **Expected**: Error message "Invalid or expired promotion code"

### Test 16: Insufficient Points
1. Try redeeming a reward with insufficient points
2. **Expected**: Button disabled, shows "Not Enough Points"

### Test 17: Membership Limits
1. User with Basic membership (20 bookings/month)
2. Try booking 21st time in same month
3. **Expected**: Error or upgrade prompt

---

## 📊 PERFORMANCE TESTING

### Test 18: Page Load Times
1. Open DevTools → Network tab
2. Navigate to each page
3. **Expected Load Times**:
   - Dashboard: < 2s
   - Booking page: < 1.5s
   - Admin pages: < 2.5s
4. **Verify**: No console errors

### Test 19: API Response Times
1. Open DevTools → Network tab
2. Trigger API calls (forecast, court status)
3. **Expected Response Times**:
   - `/api/admin/forecast`: < 1s
   - `/api/admin/courts/status`: < 500ms
4. **Verify**: Proper caching (304 responses)

### Test 20: Database Query Performance
1. Navigate to `/admin/payments` (loads 100 bookings)
2. Check page load time
3. **Expected**: < 2s even with large dataset
4. **Verify**: Indexes are being used (check Supabase logs)

---

## 🐛 BUG TRACKING

### Known Issues
- [ ] `npm run dev` JSON parse error (Next.js cache issue)
  - **Fix**: Delete `.next` folder and restart
- [ ] Favicon.ico 404 errors (cosmetic)
  - **Fix**: Add favicon to `/public` folder

### Test Results Template
```
Test #: [Number]
Feature: [Name]
Status: ✅ PASS / ❌ FAIL
Notes: [Any observations]
Screenshot: [If applicable]
```

---

## ✅ ACCEPTANCE CRITERIA

### Must Pass (Critical)
- [ ] All database migrations run successfully
- [ ] Booking flow works end-to-end
- [ ] Payment processing (dev mode) works
- [ ] Admin dashboard loads without errors
- [ ] Mobile responsive on all pages

### Should Pass (Important)
- [ ] Forecast widget shows predictions
- [ ] Weather data loads
- [ ] Loyalty points system functional
- [ ] Membership tiers display correctly
- [ ] Promotions validate properly

### Nice to Have (Optional)
- [ ] Email confirmations send
- [ ] Mollie payments work (requires API key)
- [ ] Real-time updates work
- [ ] Notifications appear

---

## 🚀 READY FOR PRODUCTION?

### Checklist
- [ ] All critical tests pass
- [ ] No console errors
- [ ] Mobile responsive verified
- [ ] Performance acceptable
- [ ] Security policies working (RLS)
- [ ] Environment variables configured
- [ ] Database migrations documented

---

**Testing completed by**: _____________
**Date**: _____________
**Overall Status**: ✅ READY / ⚠️ NEEDS WORK / ❌ NOT READY

---

## 📝 NOTES

Use this section for any additional observations, bugs found, or improvements needed.

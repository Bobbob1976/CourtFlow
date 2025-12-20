# ⚡ COURTFLOW - PERFORMANCE OPTIMIZATION GUIDE

## 🎯 OPTIMIZATION GOALS

- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Database Queries**: < 100ms
- **Lighthouse Score**: > 90

---

## 🚀 IMPLEMENTED OPTIMIZATIONS

### 1. Database Optimizations ✅

#### Indexes Created
```sql
-- Booking lookups
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- Loyalty system
CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX idx_points_transactions_user ON points_transactions(user_id);

-- Promotions
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);
```

#### Query Optimization
- Use `.select()` to fetch only needed columns
- Implement pagination (`.limit()`)
- Use `.single()` for single-row queries
- Leverage RLS for automatic filtering

### 2. API Caching ✅

#### Weather API
```typescript
// Cache for 30 minutes
fetch(weatherUrl, { 
  next: { revalidate: 1800 } 
});
```

#### Forecast API
```typescript
// Cache predictions in database
await supabase
  .from('occupancy_predictions')
  .upsert({ /* cached data */ });
```

### 3. Frontend Optimizations ✅

#### Image Optimization
```tsx
import Image from 'next/image';

<Image 
  src="/logo.png"
  width={200}
  height={50}
  alt="CourtFlow"
  priority // For above-fold images
/>
```

#### Code Splitting
```tsx
// Lazy load heavy components
const RefundModal = dynamic(() => import('@/components/admin/RefundModal'));
```

#### Font Optimization
```tsx
// Use Next.js font optimization
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

---

## 🔧 ADDITIONAL OPTIMIZATIONS

### 4. Server-Side Rendering

#### Recommended Pages for SSR
- `/admin/dashboard` - Real-time data
- `/membership` - SEO important
- `/loyalty` - User-specific data

#### Implementation
```tsx
// Already using App Router (RSC by default)
export default async function Page() {
  const data = await fetchData(); // Server-side
  return <Component data={data} />;
}
```

### 5. Database Connection Pooling

#### Supabase Configuration
```typescript
// In production, use connection pooler
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const poolerUrl = supabaseUrl.replace('.supabase.co', '.pooler.supabase.com');
```

### 6. API Route Optimization

#### Response Compression
```typescript
// Next.js handles this automatically
// Ensure gzip/brotli enabled in production
```

#### Parallel Queries
```typescript
// Instead of sequential:
const bookings = await getBookings();
const courts = await getCourts();

// Use parallel:
const [bookings, courts] = await Promise.all([
  getBookings(),
  getCourts()
]);
```

---

## 📊 PERFORMANCE MONITORING

### Metrics to Track

#### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

#### Custom Metrics
- API response times
- Database query times
- Cache hit rates
- Error rates

### Monitoring Tools

#### Vercel Analytics
```bash
# Install
npm install @vercel/analytics

# Add to layout
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

#### Supabase Logs
- Monitor slow queries
- Track RLS policy performance
- Check connection pool usage

---

## 🎨 UI/UX Optimizations

### 1. Loading States

#### Skeleton Screens
```tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/4 mb-4" />
      <div className="h-64 bg-gray-700 rounded" />
    </div>
  );
}
```

#### Suspense Boundaries
```tsx
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <DataComponent />
</Suspense>
```

### 2. Optimistic Updates

```tsx
'use client';

async function handleBooking() {
  // Update UI immediately
  setBookings([...bookings, newBooking]);
  
  // Then sync with server
  try {
    await createBooking(newBooking);
  } catch (error) {
    // Rollback on error
    setBookings(bookings);
  }
}
```

### 3. Debouncing

```tsx
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((query) => {
  searchCourts(query);
}, 300);
```

---

## 🗄️ Database Optimizations

### 1. Materialized Views

```sql
-- For frequently accessed aggregations
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT 
  booking_date,
  SUM(total_cost) as revenue,
  COUNT(*) as booking_count
FROM bookings
WHERE payment_status = 'paid'
GROUP BY booking_date;

-- Refresh periodically
REFRESH MATERIALIZED VIEW daily_revenue;
```

### 2. Partial Indexes

```sql
-- Index only active bookings
CREATE INDEX idx_active_bookings 
ON bookings(booking_date) 
WHERE cancelled_at IS NULL;
```

### 3. Query Optimization

```sql
-- Use EXPLAIN ANALYZE to check query plans
EXPLAIN ANALYZE
SELECT * FROM bookings 
WHERE user_id = 'xxx' 
AND booking_date >= CURRENT_DATE;
```

---

## 🌐 CDN & Asset Optimization

### 1. Static Assets

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 2. Bundle Size

```bash
# Analyze bundle
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});

# Run analysis
ANALYZE=true npm run build
```

### 3. Tree Shaking

```typescript
// Import only what you need
import { format } from 'date-fns'; // ✅ Good
import * as dateFns from 'date-fns'; // ❌ Bad
```

---

## 🔒 Security Optimizations

### 1. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

### 2. Input Validation

```typescript
import { z } from 'zod';

const bookingSchema = z.object({
  courtId: z.string().uuid(),
  date: z.string().date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// Validate before processing
const validated = bookingSchema.parse(input);
```

---

## 📱 Mobile Optimizations

### 1. Touch Targets

```css
/* Minimum 44x44px touch targets */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}
```

### 2. Viewport Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
```

### 3. Reduce JavaScript

```typescript
// Use CSS animations instead of JS when possible
// Prefer native browser features
```

---

## 🧪 PERFORMANCE TESTING

### Lighthouse CI

```bash
# Install
npm install -g @lhci/cli

# Run
lhci autorun --config=lighthouserc.json
```

### Load Testing

```bash
# Install k6
brew install k6

# Create test script
// load-test.js
import http from 'k6/http';

export default function () {
  http.get('http://localhost:3000/api/admin/forecast?clubId=xxx');
}

# Run test
k6 run --vus 10 --duration 30s load-test.js
```

---

## 📈 OPTIMIZATION CHECKLIST

### Before Deployment
- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle size (< 200KB initial)
- [ ] Test on 3G network
- [ ] Verify all images optimized
- [ ] Enable compression
- [ ] Configure CDN
- [ ] Set up monitoring
- [ ] Test database indexes

### Post-Deployment
- [ ] Monitor Core Web Vitals
- [ ] Track API response times
- [ ] Check error rates
- [ ] Review slow queries
- [ ] Optimize based on real data

---

## 🎯 PERFORMANCE TARGETS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Page Load | < 2s | TBD | ⏳ |
| API Response | < 500ms | TBD | ⏳ |
| Database Query | < 100ms | TBD | ⏳ |
| Lighthouse Score | > 90 | TBD | ⏳ |
| Bundle Size | < 200KB | TBD | ⏳ |

---

## 💡 QUICK WINS

1. **Enable Caching**: Already implemented ✅
2. **Add Indexes**: Already implemented ✅
3. **Optimize Images**: Use Next.js Image component
4. **Lazy Load**: Use dynamic imports
5. **Reduce Bundle**: Tree shake imports
6. **Use CDN**: Configure in production
7. **Enable Compression**: Automatic in Vercel
8. **Monitor Performance**: Add analytics

---

**Performance Audit Date**: _____________
**Audited By**: _____________
**Next Review**: _____________

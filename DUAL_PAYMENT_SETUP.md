# 💳 Dual Payment Setup: Mollie + Stripe

CourtFlow ondersteunt **beide** payment providers! Clubs kunnen kiezen tussen:
- **Mo

llie**: iDEAL, Bancontact (🇳🇱 Nederlandse markt)
- **Stripe**: Creditcards (🌍 Internationaal)
- **Both**: Laat gebruikers kiezen!

---

## 🚀 Setup Guide

### **1. Run Database Migration**

In Supabase SQL Editor:
```sql
-- Run: supabase/migrations/051_add_stripe_support.sql
```

###  **2. Get Stripe API Keys**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### **3. Setup Webhook**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. URL: `https://your-domain.com/api/stripe/webhook`
4. Events: Select **"payment_intent.succeeded"** and **"payment_intent.payment_failed"**
5. Copy **Signing secret** (starts with `whsec_`)

### **4. Add to `.env.local`**

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### **5. Configure Club**

In Supabase:
```sql
-- Set payment provider for demo club
UPDATE clubs 
SET payment_provider = 'both'  -- Options: 'mollie', 'stripe', or 'both'
WHERE subdomain = 'demo-club';
```

---

## 🎨 Usage in Components

```tsx
import PaymentProviderSelector from '@/components/payment/PaymentProviderSelector';
import StripeCheckout from '@/components/payment/StripeCheckout';

// In your booking component:
const [selectedProvider, setSelectedProvider] = useState<'mollie' | 'stripe'>('mollie');

<PaymentProviderSelector
  availableProviders="both"  // from club settings
  onSelect={setSelectedProvider}
  selectedProvider={selectedProvider}
/>

{selectedProvider === 'stripe' && (
  <StripeCheckout
    bookingId={bookingId}
    amount={30.00}
    onSuccess={() => router.push('/success')}
    onError={(err) => console.error(err)}
  />
)}
```

---

## ✅ Benefits

| Feature | Mollie | Stripe |
|---------|--------|--------|
| iDEAL | ✅ | ❌ |
| Bancontact | ✅ | ❌ |
| Creditcards | ✅ | ✅ |
| International | ⚠️ Limited | ✅ Full |
| NL Market | ✅ Best | ⚠️ OK |
| Fees (EU) | 1.29% | 1.4% + €0.25 |

**Recommendation:** Use **"both"** to give users choice!

---

## 🔧 Testing

**Test Cards (Stripe):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Test Mollie:** Use Mollie Test Mode in dashboard

---

## 📊 Analytics

Track payment provider usage:
```sql
SELECT 
  payment_provider,
  COUNT(*) as bookings,
  SUM(total_price) as revenue
FROM bookings
WHERE payment_status = 'paid'
GROUP BY payment_provider;
```

🎉 **You're all set!**

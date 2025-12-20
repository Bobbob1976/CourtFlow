# 🛠️ ADMIN QUICK START GUIDE

## Welkom Admin! 👋

Deze handleiding helpt je om snel aan de slag te gaan met het CourtFlow Admin Dashboard.

---

## 📊 DASHBOARD OVERVIEW

### Wat zie je op het dashboard?

1. **Quick Stats** (Bovenaan)
   - Today's Revenue
   - Active Bookings
   - Occupancy Rate
   - Pending Actions

2. **Smart Forecast Widget** (Links)
   - AI-powered occupancy prediction
   - Weather impact analysis
   - Confidence level (60-95%)
   - Actionable recommendations

3. **Visual Court Grid** (Rechts)
   - Real-time court status
   - Color-coded availability
   - Countdown timers
   - Quick actions

---

## 🎯 COMMON TASKS

### 1. Process a Refund

**Stappen:**
1. Ga naar **Payments** in sidebar
2. Vind de booking die gerefund moet worden
3. Klik op **Refund** button
4. Vul reden in (optioneel)
5. Klik **Confirm Refund**
6. ✅ Refund wordt automatisch verwerkt via Mollie

**Tijdlijn:**
- Mollie refund: Instant
- Geld terug bij klant: 3-5 werkdagen

### 2. Backfill Historical Data

**Waarom?**
- Betere AI forecasts
- Meer accurate predictions
- Betere insights

**Stappen:**
1. Ga naar **Data Management**
2. Klik **Run Backfill**
3. Selecteer periode (30/60/90 dagen)
4. Klik **Start Backfill**
5. ✅ Data wordt gevuld

**Aanbeveling:** Run 90 dagen voor beste resultaten

### 3. Check Court Status

**Real-time monitoring:**
1. Ga naar **Dashboard**
2. Bekijk **Visual Court Grid**

**Status Colors:**
- 🟢 **Groen** = Available
- 🔵 **Blauw** = Occupied (met countdown)
- 🔴 **Rood** = Maintenance
- 🟡 **Geel** = Payment Pending

**Auto-refresh:** Elke 30 seconden

### 4. View Forecast

**AI Predictions:**
1. Ga naar **Dashboard**
2. Bekijk **Smart Forecast Widget**

**Wat zie je:**
- Predicted occupancy (%)
- Confidence level
- Weather conditions
- Recommendations

**Gebruik voor:**
- Staffing decisions
- Pricing adjustments
- Marketing campaigns

### 5. Manage Bookings

**Overzicht:**
1. Ga naar **Bookings**
2. Zie alle bookings (past & future)

**Filters:**
- Status (confirmed, cancelled, pending)
- Date range
- Court
- User

**Acties:**
- View details
- Cancel booking
- Contact user
- Process refund

### 6. Track Revenue

**Financials:**
1. Ga naar **Financials**
2. Zie revenue breakdown

**Metrics:**
- Total Revenue
- Total Expenses
- Net Balance
- VAT (21%)

**Export:**
- Download CSV
- Generate reports
- Tax documentation

---

## 🤖 AI FEATURES

### Smart Forecast

**Hoe werkt het?**
1. Analyseert historical data
2. Checkt weather forecast
3. Berekent predicted occupancy
4. Geeft confidence level

**Accuracy:**
- Met data: 85-95%
- Zonder data: 60-70%

**Verbeter accuracy:**
- Run backfill (90 dagen)
- Meer bookings = betere predictions
- Update regelmatig

### Weather Integration

**Data source:** Open-Meteo (gratis!)

**Wat wordt getracked:**
- Temperature
- Precipitation
- Wind speed
- Weather condition

**Impact op forecast:**
- Regen = lagere occupancy
- Mooi weer = hogere occupancy
- Extreme temperaturen = lagere occupancy

---

## 💳 PAYMENT MANAGEMENT

### Payment Status

**Statussen:**
- **Paid** ✅ = Betaling succesvol
- **Pending** ⏳ = Wacht op betaling
- **Failed** ❌ = Betaling mislukt
- **Refunded** 💰 = Terugbetaald

### Refund Policy

**Automatisch:**
- Cancellation > 24h: 100% refund
- Cancellation < 24h: 50% refund
- No-show: 0% refund

**Manueel:**
- Admin kan altijd 100% refunden
- Reden optioneel maar aanbevolen
- Instant processing

### Mollie Integration

**Test Mode:**
- Gebruik test API key
- Geen echte betalingen
- Test alle flows

**Live Mode:**
- Gebruik live API key
- Echte betalingen
- KYC verificatie vereist

---

## 👥 MEMBER MANAGEMENT

### Membership Tiers

**Basic (€29.99/maand):**
- 10% discount
- 20 bookings/maand
- Priority support

**Premium (€49.99/maand):**
- 20% discount
- Unlimited bookings
- Priority booking (24h advance)
- Free birthday court

**VIP (€99.99/maand):**
- 30% discount
- Unlimited bookings
- Priority booking (48h advance)
- Personal locker
- Free equipment rental

### Member Actions

**Upgrade:**
1. Find member
2. Click **Upgrade**
3. Select new tier
4. Confirm

**Downgrade:**
- Takes effect next billing cycle
- Member keeps benefits until then

**Cancel:**
- Member keeps access until end of period
- No refund for current period

---

## 📊 ANALYTICS & REPORTS

### Key Metrics

**Occupancy Rate:**
- Total booked hours / Total available hours
- Target: 70-80%
- Peak hours: 18:00-22:00

**Revenue per Court:**
- Total revenue / Number of courts
- Identify top performers
- Optimize pricing

**Member Retention:**
- Active members / Total members
- Target: > 80%
- Track monthly

### Export Data

**Bookings:**
- CSV export
- Date range filter
- Include cancelled

**Members:**
- Full member list
- Contact info
- Membership status

**Financials:**
- Revenue reports
- VAT breakdown
- Expense tracking

---

## 🔧 TROUBLESHOOTING

### Forecast not showing

**Check:**
1. Historical data populated?
2. Weather API working?
3. Browser console errors?

**Fix:**
1. Run backfill
2. Refresh page
3. Check network tab

### Refund failed

**Reasons:**
- Mollie API key incorrect
- Payment already refunded
- Insufficient balance

**Fix:**
1. Check Mollie dashboard
2. Verify API key
3. Contact Mollie support

### Court grid not updating

**Check:**
1. Auto-refresh enabled?
2. Network connection?
3. Browser cache?

**Fix:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear cache
3. Check console

---

## 🆘 NEED HELP?

### Resources

- 📚 **Full Documentation**: `/admin/help`
- 🎥 **Video Tutorials**: Coming soon
- 📧 **Support Email**: admin-support@courtflow.app
- 💬 **Live Chat**: Available 9-17 CET

### Quick Links

- [Process Refund](/admin/payments)
- [Backfill Data](/admin/data-management)
- [View Forecast](/admin/forecast-test)
- [Manage Members](/admin/members)

---

## ✅ DAILY CHECKLIST

**Morning (9:00):**
- [ ] Check dashboard stats
- [ ] Review forecast for today
- [ ] Check pending payments
- [ ] Respond to member emails

**Midday (13:00):**
- [ ] Monitor court occupancy
- [ ] Process any refunds
- [ ] Update maintenance schedule

**Evening (18:00):**
- [ ] Check peak hour bookings
- [ ] Review revenue for day
- [ ] Plan staffing for tomorrow

**Weekly:**
- [ ] Run backfill (if needed)
- [ ] Review member retention
- [ ] Analyze revenue trends
- [ ] Update promotions

---

**Veel succes met het beheren van je facility!** 🎾💪

*Laatste update: December 2025*

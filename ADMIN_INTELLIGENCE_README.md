# 🤖 Admin Intelligence & Forecasting System

## ✅ COMPLETED FEATURES

### 1. **Database Schema** ✅
- `court_occupancy_history` - Historical occupancy data for ML training
- `weather_cache` - Weather API response caching
- `occupancy_predictions` - AI-generated forecasts
- `court_maintenance` - Court status tracking

### 2. **Weather Integration** ✅
- **Open-Meteo API** (100% FREE - no API key needed!)
- Real-time weather data for Amsterdam
- 24-hour weather forecast
- Smart weather impact calculations
- Automatic fallback to mock data

### 3. **Smart Forecast Widget** ✅
- AI-powered occupancy predictions
- Weather-adjusted forecasts
- Confidence levels (60-95%)
- Actionable recommendations
- Beautiful gradient UI

### 4. **Visual Court Grid** ✅
- Real-time court status display
- Color-coded status (green/blue/red/yellow)
- Countdown timers for active bookings
- Player avatars
- Quick action menu

### 5. **Historical Data Management** ✅
- Automatic occupancy tracking
- Backfill tool for existing bookings
- Admin UI for data management
- Stats and analytics

### 6. **Forecast Test Dashboard** ✅
- Weather status display
- Historical data stats
- Occupancy by day/hour charts
- Recent predictions table
- API test links

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Run Database Migrations

Run these SQL files in Supabase SQL Editor (in order):

```sql
-- 1. Create intelligence tables
040_admin_intelligence_schema.sql

-- 2. Populate historical data
041_populate_occupancy_history.sql
```

### Step 2: Backfill Historical Data

1. Go to: `http://localhost:3000/admin/data-management`
2. Select "Last 90 days"
3. Click "Run Backfill"
4. Wait for completion

### Step 3: Test the System

1. **Dashboard**: `http://localhost:3000/admin/dashboard`
   - View Smart Forecast Widget
   - See Visual Court Grid
   
2. **Test Page**: `http://localhost:3000/admin/forecast-test`
   - Check weather data
   - View historical stats
   - See prediction accuracy

3. **API Test**: `http://localhost:3000/api/admin/forecast?clubId=90f93d47-b438-427c-8b33-0597817c1d96`
   - Raw JSON forecast data

---

## 📊 HOW IT WORKS

### Forecast Algorithm

```
Predicted Occupancy = Historical Average × Weather Multiplier × Weekend Multiplier

Where:
- Historical Average = Avg occupancy for this day/hour (last 90 days)
- Weather Multiplier = 1.15 (rainy), 1.10 (snowy), 1.0 (other) for indoor courts
- Weekend Multiplier = 1.2 (Sat/Sun), 1.0 (weekdays)
```

### Confidence Calculation

```
Base Confidence: 60%
+ Historical Data Available: +20%
+ Weather Data Available: +10%
+ Data Quality Bonus: +5%
= Total: 60-95%
```

### Weather Impact (Indoor Courts)

- ☀️ **Sunny**: No change (1.0x)
- ☁️ **Cloudy**: No change (1.0x)
- 🌧️ **Rainy**: +15% occupancy (1.15x)
- ❄️ **Snowy**: +10% occupancy (1.10x)

---

## 🎯 FEATURES IN DETAIL

### Smart Forecast Widget

**Location**: Dashboard (top section)

**Shows**:
- Predicted occupancy for tomorrow
- Confidence level
- Weather conditions
- Temperature
- Actionable recommendations

**Recommendations**:
- **85%+ occupancy**: "Plan extra personeel in. Verwacht hoge drukte - overweeg premium pricing."
- **70-85%**: "Normale bezetting verwacht. Standaard personeelsbezetting is voldoende."
- **50-70%**: "Gemiddelde drukte. Overweeg een promotie om bezetting te verhogen."
- **<50%**: "Rustige dag verwacht. Perfect voor onderhoud of marketing campagnes."

### Visual Court Grid

**Location**: Dashboard (main section)

**Status Colors**:
- 🟢 **Green**: Available
- 🔵 **Blue**: Occupied (with countdown timer)
- 🔴 **Red**: Maintenance
- 🟡 **Yellow**: Payment Pending (animated pulse)

**Features**:
- Real-time updates (every 30 seconds)
- Player avatars
- Quick actions (Verlengen, Verplaatsen, Annuleren)
- Time remaining display

### Data Management

**Location**: `/admin/data-management`

**Features**:
- Historical data stats
- Backfill tool (30/60/90/180/365 days)
- Recent data preview
- Revenue tracking

---

## 🔧 TECHNICAL DETAILS

### API Endpoints

1. **GET** `/api/admin/forecast?clubId={id}`
   - Returns AI forecast for tomorrow
   - Includes weather data
   - Caches predictions in database

2. **GET** `/api/admin/courts/status?clubId={id}`
   - Returns real-time court status
   - Includes current bookings
   - Maintenance info

### Server Actions

1. `updateOccupancyHistory(bookingId)`
   - Called after booking creation/cancellation
   - Updates historical data automatically

2. `backfillOccupancyHistory(clubId, days)`
   - Populates history from existing bookings
   - Used for initial setup

### Database Functions

1. `get_historical_average(club_id, day_of_week, hour)`
   - Returns average occupancy for specific time slot
   - Uses last 90 days of data

2. `calculate_occupancy_rate(club_id, date)`
   - Calculates daily occupancy by hour
   - Returns table of hourly rates

---

## 📈 FUTURE IMPROVEMENTS

### Phase 2 (Next Steps):

1. **Machine Learning Model**
   - Train on historical data
   - Improve prediction accuracy
   - Multi-day forecasts

2. **Advanced Weather Integration**
   - Location-based weather (per club)
   - Severe weather alerts
   - Historical weather correlation

3. **Dynamic Pricing**
   - Price recommendations based on demand
   - Surge pricing for high occupancy
   - Discount suggestions for low occupancy

4. **Mobile App**
   - Push notifications for forecasts
   - Quick booking from grid
   - Staff scheduling integration

5. **Reporting**
   - Forecast accuracy tracking
   - Revenue optimization reports
   - Staff efficiency metrics

---

## 🐛 TROUBLESHOOTING

### No Forecast Data?

1. Check if historical data exists:
   ```sql
   SELECT COUNT(*) FROM court_occupancy_history;
   ```

2. Run backfill:
   - Go to `/admin/data-management`
   - Click "Run Backfill"

### Weather Data Not Loading?

- Open-Meteo is free and doesn't need API key
- Check internet connection
- System will fallback to mock data automatically

### Predictions Not Updating?

- Predictions are cached for 1 hour
- Clear cache by visiting `/api/admin/forecast?clubId={id}` directly

---

## 📝 NOTES

- **Weather API**: Uses Open-Meteo (free, no API key)
- **Location**: Currently hardcoded to Amsterdam (52.3676, 4.9041)
- **Update Frequency**: Forecasts refresh every hour
- **Historical Data**: Recommended minimum 30 days for accuracy
- **Confidence**: Never reaches 100% (capped at 95%)

---

## 🎉 SUCCESS METRICS

After implementation, you should see:

- ✅ Smart Forecast Widget on dashboard
- ✅ Visual Court Grid with real-time status
- ✅ Historical data populated
- ✅ Weather data loading
- ✅ Predictions being generated
- ✅ Confidence levels 85-95%

---

**Built with ❤️ for COURTFLOW**
**Version**: 1.0.0
**Last Updated**: December 2025

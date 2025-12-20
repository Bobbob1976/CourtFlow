# SQL Migration Uitvoer Guide

## ⚠️ Probleem met Originele Migrations

De migrations 032, 033, en 034 hadden 2 problemen:
1. **Syntax error** in 034: `0.25.5` moet `0.255` zijn (Finland tax rate)
2. **Volgorde probleem**: Migration 034 probeerde data in `tax_rates` table te inserten voordat deze bestond

## ✅ Oplossing: Gebruik Combined Migration

Ik heb een **gecombineerde migration** gemaakt die alles in de juiste volgorde doet:

**File:** `035_international_tax_system_combined.sql`

## 📝 Hoe Uit Te Voeren

### Optie 1: Via Supabase Dashboard (Aanbevolen)

1. **Open Supabase Dashboard**
   - Ga naar https://supabase.com/dashboard
   - Selecteer je project

2. **Open SQL Editor**
   - Klik op "SQL Editor" in het linker menu
   - Klik op "New query"

3. **Kopieer de Migration**
   - Open `supabase/migrations/035_international_tax_system_combined.sql`
   - Kopieer ALLE inhoud (Ctrl+A, Ctrl+C)
   - Plak in de SQL Editor

4. **Run de Migration**
   - Klik op "Run" (of Ctrl+Enter)
   - Wacht tot het klaar is (kan 5-10 seconden duren)

5. **Verifieer**
   ```sql
   -- Check of tax_rates table bestaat
   SELECT COUNT(*) FROM tax_rates;
   -- Zou 30 moeten zijn (30 landen)
   
   -- Check of country_code column bestaat
   SELECT country_code FROM clubs LIMIT 1;
   -- Zou 'NL' moeten zijn
   
   -- Test de functie
   SELECT * FROM get_active_tax_rate('NL', CURRENT_DATE);
   -- Zou Nederlandse tax rates moeten tonen
   ```

### Optie 2: Via Supabase CLI

```bash
# In je project directory
cd "c:\Selfmade Apps\COURTFLOW\COURTFLOW"

# Run de migration
supabase db push

# Of specifiek deze migration
supabase migration up 035_international_tax_system_combined
```

## 🔍 Wat Doet Deze Migration?

### Part 1: Country Code Column
- Voegt `country_code` toe aan `clubs` table
- Default waarde: 'NL'
- Index voor snelle lookups

### Part 2: Tax Rates Table
- Creëert `tax_rates` table met versioning
- Ondersteunt historische tracking
- Unique constraint op (country_code, effective_from)

### Part 3: Insert 30 Countries
- Europa: 20 landen
- Americas: 4 landen (US, CA, MX, BR)
- Asia-Pacific: 5 landen (AU, NZ, JP, SG, IN)
- Middle East & Africa: 2 landen (AE, ZA)

### Part 4: Functions
- `get_active_tax_rate()` - Haal actief tarief op
- `add_tax_rate_update()` - Voeg nieuw tarief toe

### Part 5: Validation
- Trigger om alleen supported countries toe te staan
- Automatische validatie bij insert/update

### Part 6: Permissions
- Grant SELECT/UPDATE rechten aan authenticated users

## ✅ Verificatie Queries

Na het runnen van de migration, test met deze queries:

```sql
-- 1. Check aantal landen
SELECT COUNT(*) as total_countries FROM tax_rates WHERE effective_until IS NULL;
-- Expected: 30

-- 2. Check Nederlandse rates
SELECT * FROM get_active_tax_rate('NL', CURRENT_DATE);
-- Expected: sport_rate=0.09, goods_rate=0.21, currency='€'

-- 3. Check Amerikaanse rates
SELECT * FROM get_active_tax_rate('US', CURRENT_DATE);
-- Expected: sport_rate=0.00, goods_rate=0.08, currency='$'

-- 4. Check Canadese rates
SELECT * FROM get_active_tax_rate('CA', CURRENT_DATE);
-- Expected: sport_rate=0.05, goods_rate=0.13, currency='C$'

-- 5. Lijst alle landen
SELECT country_code, country_name, currency, sport_label, goods_label 
FROM tax_rates 
WHERE effective_until IS NULL 
ORDER BY country_name;

-- 6. Test validation (zou moeten falen)
UPDATE clubs SET country_code = 'XX' WHERE id = (SELECT id FROM clubs LIMIT 1);
-- Expected: ERROR: Country code XX is not supported

-- 7. Test validation (zou moeten werken)
UPDATE clubs SET country_code = 'US' WHERE id = (SELECT id FROM clubs LIMIT 1);
-- Expected: Success
```

## 🐛 Troubleshooting

### Error: "relation tax_rates already exists"
**Oplossing:** De table bestaat al. Skip Part 2 of gebruik:
```sql
DROP TABLE IF EXISTS tax_rates CASCADE;
-- Dan run de hele migration opnieuw
```

### Error: "column country_code already exists"
**Oplossing:** De column bestaat al. Skip Part 1 of gebruik:
```sql
ALTER TABLE clubs DROP COLUMN IF EXISTS country_code;
-- Dan run de hele migration opnieuw
```

### Error: "duplicate key value violates unique constraint"
**Oplossing:** Data bestaat al. Dit is OK! De `ON CONFLICT DO NOTHING` zorgt ervoor dat duplicates worden geskipt.

## 📊 Expected Results

Na succesvolle uitvoering:
- ✅ `clubs` table heeft `country_code` column
- ✅ `tax_rates` table bestaat met 30 rows
- ✅ Functies `get_active_tax_rate()` en `add_tax_rate_update()` bestaan
- ✅ Trigger `validate_club_country_code` is actief
- ✅ Alle permissions zijn correct

## 🚀 Volgende Stappen

Na succesvolle migration:
1. Test de onboarding flow: `/onboarding`
2. Test de admin tax settings: `/admin/tax-settings`
3. Test de tax breakdown: `/admin/financials`
4. Update je code om `getTaxConfigFromDB()` te gebruiken

## 📝 Notities

- **Oude migrations (032, 033, 034)** kunnen worden genegeerd
- **Migration 035** is de complete, gecombineerde versie
- **Veilig om opnieuw te runnen** dankzij `IF NOT EXISTS` en `ON CONFLICT`
- **Geen data verlies** - bestaande data blijft intact

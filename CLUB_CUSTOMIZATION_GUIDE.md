# 🎨 Club Personalisatie - Quick Start Guide

## Voor Club Owners/Admins

CourtFlow clubs kunnen nu volledig worden gepersonaliseerd! Maak van je booking pagina een **unieke brand experience**.

---

## 🚀 STAP 1: Run Database Migration

1. Open **Supabase Dashboard** → SQL Editor
2. Copy inhoud van `supabase/migrations/049_club_customization_features.sql`
3. Paste en Execute
4. ✅ Done! Database is klaar

---

## 🎨 STAP 2: Personaliseer Je Club

### **Upload Club Logo**
```sql
UPDATE clubs 
SET custom_logo_url = 'https://jouw-cdn.com/logo.png'
WHERE id = 'jouw-club-id';
```

### **Set Brand Colors**
```sql
UPDATE clubs 
SET 
  primary_color = '#00d084',    -- Groen (of jouw kleur)
  secondary_color = '#ff6b35'   -- Oranje (of jouw kleur)
WHERE id = 'jouw-club-id';
```

**Voorbeelden van kleur combinaties:**
- **Energiek:** `#ff6b35` + `#00d084` (oranje/groen) - current default
- **Professional:** `#1e40af` + `#0891b2` (navy/cyan)
- **Elegant:** `#7c3aed` + `#ec4899` (purple/pink)
- **Natural:** `#059669` + `#65a30d` (emerald/lime)

### **Upload Banner Image**
```sql
UPDATE clubs 
SET custom_banner_url = 'https://jouw-cdn.com/banner.jpg'
WHERE id = 'jouw-club-id';
```

**Banner tips:**
- Ideale afmeting: 1920x600px
- Toon je courts in actie
- Gebruik hoge kwaliteit foto's
- Houd tekst leesbaar

### **Custom Welcome Message**
```sql
UPDATE clubs 
SET welcome_message = 'Welkom bij PadelDam! De leukste padelclub van Amsterdam 🎾'
WHERE id = 'jouw-club-id';
```

### **Add Photo Gallery**
```sql
UPDATE clubs 
SET gallery_images = '[
  "https://cdn.com/court1.jpg",
  "https://cdn.com/court2.jpg",
  "https://cdn.com/action1.jpg",
  "https://cdn.com/team.jpg"
]'::jsonb
WHERE id = 'jouw-club-id';
```

### **Choose Theme Mode**
```sql
UPDATE clubs 
SET theme_mode = 'vibrant'  -- Opties: default, vibrant, minimal, professional
WHERE id = 'jouw-club-id';
```

**Theme Modes:**
- `default` - CourtFlow standaard (groen/oranje, modern)
- `vibrant` - Extra energiek met felle kleuren en animaties
- `minimal` - Clean, wit, simpel, veel white space
- `professional` - Zakelijk, donker, premium feel

---

## 🎛️ STAP 3: Feature Toggles

Enable/disable features per club:

```sql
UPDATE clubs 
SET features = '{
  "weather_widget": true,
  "achievements": true,
  "social_feed": true,
  "partner_suggestions": true,
  "live_status": true
}'::jsonb
WHERE id = 'jouw-club-id';
```

**Features uitleg:**
- `weather_widget` - Weersverwachting voor outdoor courts
- `achievements` - Badges en gamification voor spelers
- `social_feed` - Social posts en updates
- `partner_suggestions` - AI partner matching
- `live_status` - Real-time court beschikbaarheid

---

## 📸 STAP 4: Content Tips

### **Logo Specificaties:**
- Formaat: PNG met transparantie
- Afmeting: 200x200px minimum (vierkant werkt best)
- File size: < 500KB
- Duidelijk zichtbaar op donkere achtergrond

### **Banner Specificaties:**
- Formaat: JPG of PNG
- Afmeting: 1920x600px (3:1 ratio)
- File size: < 2MB
- Focus point: Center (belangrijk voor mobile crop)

### **Gallery Photos:**
- Minimaal 4, maximaal 12 foto's
- Mix van: courts, actie, faciliteiten, sfeer
- Consistente stijl (zelfde filter/edit)
- Hoge kwaliteit (niet blurry)

---

## 🎨 VOORBEELDEN

### **Voorbeeld 1: Sportieve Club**
```sql
UPDATE clubs SET
  primary_color = '#22c55e',
  secondary_color = '#f97316',
  theme_mode = 'vibrant',
  welcome_message = '⚡ Klaar voor actie? Boek nu en speel!',
  features = '{"weather_widget": true, "achievements": true}'::jsonb
WHERE subdomain = 'sportief';
```

### **Voorbeeld 2: Premium Club**
```sql
UPDATE clubs SET
  primary_color = '#0891b2',
  secondary_color = '#8b5cf6',
  theme_mode = 'professional',
  welcome_message = 'Welcome to the most exclusive padel experience',
  features = '{"live_status": true, "partner_suggestions": true}'::jsonb
WHERE subdomain = 'premium';
```

### **Voorbeeld 3: Family-Friendly**
```sql
UPDATE clubs SET
  primary_color = '#f59e0b',
  secondary_color = '#10b981',
  theme_mode = 'minimal',
  welcome_message = 'Welkom families! Speel samen en maak herinneringen 👨‍👩‍👧‍👦',
  features = '{"social_feed": true, "achievements": true}'::jsonb
WHERE subdomain = 'family';
```

---

## 🔧 ADVANCED: Admin Panel (Coming Soon)

We bouwen een admin panel waar je dit visueel kunt doen:

**Geplande Features:**
- 🎨 Visual color picker
- 📤 Drag & drop image upload
- 👁️ Live preview
- 📱 Mobile preview
- 💾 One-click save
- 🔄 Reset to defaults

**ETA:** Q1 2025

---

## ❓ FAQ

**Q: Kan ik de CourtFlow logo vervangen?**  
A: Ja! Upload je eigen logo en het wordt overal gebruikt (navbar, PWA icon, etc).

**Q: Hoeveel kost personalisatie?**  
A: Gratis! Alle clubs kunnen dit gebruiken.

**Q: Kan ik terug naar standaard kleuren?**  
A: Ja, set `theme_mode = 'default'` en verwijder custom colors.

**Q: Werkt dit op de mobiele app?**  
A: Ja! Alles is responsive en sync met PWA.

**Q: Kan ik per court verschillende kleuren?**  
A: Nog niet, maar komt in v3.0!

---

## 🆘 Support

Problemen? Vragen?
- 📧 Email: support@courtflow.app
- 💬 Discord: [courtflow.chat](https://discord.gg/courtflow)
- 📖 Docs: [docs.courtflow.app](https://docs.courtflow.app)

---

🎾 **Happy Customizing!** Maak van je club een unieke experience! 🚀

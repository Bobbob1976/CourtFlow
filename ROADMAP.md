# 🚀 CourtFlow Productie Roadmap

Status bijgewerkt: 22 december 2024

## 🟢 1. Core Functionaliteit (Gereed)
| Feature | Status | Opmerking |
| :--- | :---: | :--- |
| **Authenticatie** | ✅ | Supabase Auth (Login/Register/Reset) |
| **Database Schema** | ✅ | Clubs, Courts, Bookings, Profiles |
| **Booking Engine** | ✅ | Conflictdetectie, Datepicker, Baanselectie |
| **Stripe Betalingen** | ✅ | Checkout sessies & Webhook handling |
| **Whitelabel Branding** | ✅ | Logo, Banner, Kleuren instelbaar per club |
| **Image Hosting** | ✅ | Drag & drop uploads naar Supabase Storage |
| **Basis Reporting** | ✅ | Totale omzet berekening (Live) |

## 🟡 2. Dashboard & Data (Deels Mock/Fake)
| Feature | Huidige Staat | Actie Nodig |
| :--- | :--- | :--- |
| **Baan Bezetting %** | Hardcoded getal | SQL functie voor bezettingsgraad berekening |
| **Actieve Leden** | Hardcoded getal | Query voor unieke boekers afgelopen 30 dagen |
| **Live Baan Grid** | Fake data | Koppelen aan actuele boekingen (Real-time) |
| **AI Forecast** | Mock UI | Versimpelen naar historische data trend of Weather API |
| **Action Center** | Fake notificaties | Koppelen aan echte events (failed payments, etc) |
| **Financiële Uitgaven**| Lege tabel | Formulier maken om kosten in te voeren |

## 🔴 3. Admin Tools (Nog Te Bouwen)
| Feature | Prioriteit | Beschrijving |
| :--- | :---: | :--- |
| **Boeking Management** | 🔥 HOOG | Admin moet boekingen kunnen annuleren/verplaatsen |
| **Openingstijden** | 🔥 HOOG | Instelbaar per dag via Admin Settings |
| **Blokkades** | ⚡ MEDIUM | Banen blokkeren voor onderhoud/toernooien |
| **Prijsprofielen** | ⚡ MEDIUM | Pits/Dal tarieven instelbaar maken |
| **Emails** | ⏳ LAAG | Bevestigingsmails via Resend/SendGrid |

## 🔵 4. User App (Front-end)
| Feature | Status | Actie Nodig |
| :--- | :--- | :--- |
| **Mijn Boekingen** | 🚧 | Pagina bestaat, maar kan verbeterd worden (cancel optie) |
| **Profiel Pagina** | 🚧 | Basis staat, profielfoto upload toevoegen |
| **Mobiele Weergave** | ❓ | Moet getest worden op responsiveness |

# 🎾 PADEL ACTION IMAGES

## 📸 Beschikbare Afbeeldingen

Deze map bevat 9 professionele padel actie afbeeldingen voor gebruik in de CourtFlow app.

### Afbeeldingen Overzicht:

1. **padel_action_red.png** - Rode baan, doubles match, 4 spelers in actie
2. **padel_action_blue.png** - Blauwe baan, intense rally met diving actie
3. **padel_action_orange.png** - Oranje baan, team celebration
4. **padel_serve_action.png** - Krachtige serve, blauwe sportkleding
5. **padel_volley_purple.png** - Paarse baan, vrouwelijke speler bij het net
6. **padel_doubles_green.png** - Groene baan, doubles bij het net
7. **padel_smash_yellow.png** - Gele baan, overhead smash
8. **padel_celebration_cyan.png** - Cyaan baan, team high-five
9. **padel_backhand_pink.png** - Roze baan, backhand shot

---

## 💻 Gebruik in Code

### Next.js Image Component:

```tsx
import Image from 'next/image';

<Image 
  src="/images/padel/padel_action_red.png"
  alt="Padel spelers in actie"
  width={600}
  height={400}
  className="rounded-xl object-cover"
/>
```

### Als Background Image:

```tsx
<div 
  className="h-48 rounded-xl bg-cover bg-center"
  style={{ backgroundImage: "url('/images/padel/padel_action_blue.png')" }}
>
  {/* Content */}
</div>
```

### Random Image Selector:

```tsx
const padelImages = [
  '/images/padel/padel_action_red.png',
  '/images/padel/padel_action_blue.png',
  '/images/padel/padel_action_orange.png',
  '/images/padel/padel_serve_action.png',
  '/images/padel/padel_volley_purple.png',
  '/images/padel/padel_doubles_green.png',
  '/images/padel/padel_smash_yellow.png',
  '/images/padel/padel_celebration_cyan.png',
  '/images/padel/padel_backhand_pink.png',
];

const randomImage = padelImages[Math.floor(Math.random() * padelImages.length)];
```

---

## 🎨 Kleur Matching

Gebruik deze afbeeldingen op basis van je court kleur:

- **Rode banen** → `padel_action_red.png`
- **Blauwe banen** → `padel_action_blue.png`
- **Oranje banen** → `padel_action_orange.png`
- **Paarse banen** → `padel_volley_purple.png`
- **Groene banen** → `padel_doubles_green.png`
- **Gele banen** → `padel_smash_yellow.png`
- **Cyaan banen** → `padel_celebration_cyan.png`
- **Roze banen** → `padel_backhand_pink.png`

---

## 📋 TODO

Om deze afbeeldingen te gebruiken, moet je ze kopiëren naar:
`public/images/padel/`

De afbeeldingen zijn gegenereerd en opgeslagen in:
`C:/Users/PascalTeunissen/.gemini/antigravity/brain/.../`

**Kopieer ze handmatig of gebruik dit PowerShell commando:**

```powershell
# Kopieer alle gegenereerde padel afbeeldingen
Copy-Item "C:\Users\PascalTeunissen\.gemini\antigravity\brain\*\padel_*.png" -Destination "public\images\padel\" -Force
```

---

**Gegenereerd op:** December 2025
**Totaal afbeeldingen:** 9
**Formaat:** PNG
**Gebruik:** CourtFlow Dashboard, Booking Cards, Court Previews

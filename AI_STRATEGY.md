# 🤖 AI Strategie & Kostenanalyse voor CourtFlow

Om de chat-assistent "slim" te maken, moet hij antwoorden kunnen genereren (LLM) én toegang hebben tot jouw data (RAG - *Retrieval Augmented Generation*).

Hieronder de vergelijking van de meest praktische en gunstige opties.

---

## 📊 1. De Modellen Vergelijking (De "Hersenen")

Hier vergelijken we de motor die de antwoorden bedenkt.

| Optie | Provider | Kosten (per 1M tokens) | Snelheid | Kwaliteit NL | Oordeel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A. GPT-4o-mini** | OpenAI | ~$0.15 (in) / $0.60 (uit) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | *Gouden standaard, maar duurder bij schaling.* |
| **B. DeepSeek-V3** | DeepSeek | ~$0.14 (in) / $0.28 (uit) | ⭐⭐⭐ | ⭐⭐⭐⭐ | *Extreem goedkoop, privacy-vriendelijk.* |
| **C. Llama-3-8B** | **Groq** | **~$0.05 (of Gratis tier)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **🏆 Winnaar (Snelheid & Kosten)** |

### 💡 Waarom Groq + Llama 3?
*   **Snelheid:** Groq gebruikt speciale chips (LPU's) waardoor antwoorden *instant* verschijnen. Voor een chat widget is dit cruciaal; niemand wil 3 seconden naar een ladend bolletje kijken.
*   **Kosten:** Ze hebben een zeer ruime gratis tier voor developers en extreem lage prijzen daarna.
*   **Open Source:** Llama 3 (van Meta) is een van de beste open modellen en spreekt prima Nederlands.

---

## 💾 2. De Kennis Vergelijking (Het "Geheugen")

De AI moet weten: *"Is baan 4 vrij?"* of *"Wat kost een racket huren?"*.

| Optie | Technologie | Omschrijving | Kosten | Geschiktheid |
| :--- | :--- | :--- | :--- | :--- |
| **A. Database Query (SQL)** | **Supabase (Function)** | AI genereert SQL of roept een functie aan. | **Gratis** | **🏆 Winnaar voor Live Data** |
| **B. Vector Search (RAG)** | **Supabase (pgvector)** | Zoeken in documenten en regels. | **Gratis** | **🏆 Winnaar voor Kennis/FAQ** |
| **C. Assistant API** | OpenAI | Je upload files naar OpenAI. | $0.20/GB/dag | *Te duur + trager.* |

### 💡 De "Smart Tool" Aanpak
Voor CourtFlow is een hybride aanpak het beste:
1.  **Vraag:** *"Is er plek vanavond?"* -> AI roept jouw bestaande `get_available_courts` functie aan (gratis & live).
2.  **Vraag:** *"Mag ik mijn hond meenemen?"* -> AI zoekt in je reglement (middels Vector Search).

---

## ✅ 3. De Aanbevolen Architectuur (Praktisch & Gunstigst)

Dit is de meest efficiënte setup voor CourtFlow:

### **Frontend (Wat we al hebben):**
*   `AIChatWidget.tsx` (Chat interface)

### **Backend & AI (Wat we gaan bouwen):**
1.  **AI Provider:** **Groq** (met model `llama3-8b-8192`).
    *   *Reden:* Onverslaanbare snelheid en bijna gratis.
2.  **Orkestratie:** **Vercel AI SDK** (in Next.js).
    *   *Reden:* Maakt het koppelen van AI aan je frontend super makkelijk (`useChat` hook).
3.  **Data Toegang:** **Supabase**.
    *   Je database is al in Supabase. We geven de AI "tools" om data op te halen.

### 💰 Geschatte Kostenplaatje
Bij 1.000 actieve chats per maand:
*   **Optie OpenAI:** ~€5 - €10 / maand
*   **Optie Groq (Llama 3):** ~€0 - €1 (+ eventueel toekomstige pricing)

---

## 🚀 Volgende Stappen: Het Plan

Om dit te implementeren:

1.  **Setup:** Gratis API Key aanvragen bij [Groq Console](https://console.groq.com/).
2.  **Installatie:** `npm install ai @ai-sdk/openai` (Vercel AI SDK ondersteunt Groq via OpenAI-compatible interface).
3.  **Backend Route:** Een `api/chat/route.ts` maken die de berichten ontvangt en doorstuurt naar Groq.
4.  **Tools Definiëren:** De AI vertellen welke functies hij mag gebruiken (bijv. `checkAvailability`).

**Zullen we beginnen met stap 1: Het opzetten van de backend route met Groq (Llama 3)?**
*(Dit vereist een API key, die is gratis aan te maken).*

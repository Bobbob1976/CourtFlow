# Roadmap CourtFlow - Volgende Sessie

## 1. Social & Community (Verdieping)
- [x] **Leaderboards:** Voeg een tabblad 'Ranglijst' toe aan de Community pagina. Toon de Top 10 spelers op basis van XP en Level.
- [x] **Chat/Berichten:** Maak de "Bericht" knop op de Community pagina werkend.
    - [x] *Optie A:* Eenvoudige `mailto:` link.
    - *Optie B:* Intern chatsysteem (tabel `messages`).
- [ ] **Profiel Zichtbaarheid:** Zorg dat privacy instellingen gerespecteerd worden.

## 2. Admin & Financiën
- [x] **Financieel Dashboard:** Bouw een nieuwe pagina `/admin/finance`.
    - Grafieken: Omzet per maand/week.
    - Statistieken: Bezettingsgraad van de banen (Piekuren).
- [x] **Export:** Knop om boekingen te exporteren naar CSV/Excel.

## 3. Communicatie (E-mail)
- [x] **Provider Setup:** Integratie met **Resend** (of SendGrid).
- [ ] **Triggers:**
    - Bevestigingsmail bij boeking.
    - [x] Uitnodigingsmail naar vrienden ("Je bent uitgenodigd voor een potje!").
    - Notificatie bij nieuwe match resultaten.

## 4. Polish & UX
- [ ] **Mobile Check:** Test de 'Invite' flow op mobiel.
- [ ] **Empty States:** Mooiere meldingen als er nog geen data is (bijv. lege agenda, geen vrienden).
- [ ] **Performance:** Controleren of queries (zoals dashboard load) sneller kunnen.

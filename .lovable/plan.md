
## Wat moet er veranderen

De huidige preview klopt niet met de werkelijke nieuwsbrief layout. Op basis van de 3 afbeeldingen bouw ik de preview opnieuw na:

### Huidige preview (incorrect)
- Company logo + naam als header
- Divider op basis van mx-5 (niet vol breed)
- AI-ontwikkeling als badge "🚀 AI-ONTWIKKELING"
- AI feitje als accent-blokje
- CTA als kleine footer-balk

### Nieuwe preview (exact nagebouwd uit afbeeldingen)

**Sectie 1 — Intro (achtergrond_kleur achtergrond)**
- Genereuze padding (px-8 py-8)
- Vetgedrukte openingszin gevolgd door normale body tekst (grote tekst, ~15-16px)
- Tekst in `tekst_kleur`

**Sectie 2 — Oranje divider (primaire_kleur)**
- Volledige breedte, hoogte 3px, geen marge

**Sectie 3 — AI-ontwikkelingen (achtergrond_kleur)**
- Sectietitel met oranje linkerborder `|` + vet "De 5 grootste AI-ontwikkelingen van maart" in `tekst_kleur`
- Kaart op `kaart_achtergrond` met shadow, rounded corners
  - Bovenrij: oranje cirkel met "1" + oranje pill-badge "Baanbrekend" (beide `primaire_kleur`)
  - Vetgedrukte titel in `tekst_kleur`
  - Body tekst in `subtekst_kleur`
  - Dunne horizontale lijn (subtekst_kleur/20)
  - Italic oranje MKB-tip tekst (`primaire_kleur`)

**Sectie 4 — AI feitje (achtergrond_kleur)**
- Sectietitel met oranje linkerborder "Wist je dat..." 
- Accent card op `accent_kleur` met oranje linkerborder (`primaire_kleur`)
  - 💡 emoji + vetgedrukte tekst (`tekst_kleur`)
  - Italic body tekst (`subtekst_kleur`)

**Sectie 5 — CTA (primaire_kleur achtergrond)**
- Grote witte vetgedrukte kop (cta_tekst)
- Witte subtekst
- Witte afgeronde card met primaire_kleur gekleurde CTA tekst

**Sectie 6 — Footer (achtergrond_kleur)**
- Bedrijfsnaam vet gecentreerd (`tekst_kleur`)
- Tagline in `tekst_kleur`
- Website link in `primaire_kleur`
- Dunne divider
- "Afmelden van deze nieuwsbrief" + copyright in `subtekst_kleur`

### Schaalgrootte
De preview kaart is vrij groot (rechter helft van het scherm). Een `transform: scale(0.85)` of `overflow-y: auto` met vaste hoogte (~580px) zorgt dat alles past zonder scrollen.

### Bestand
| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | Regels 599–673: preview sectie volledig vervangen door bovenstaande structuur |

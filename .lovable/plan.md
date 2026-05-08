
## Plan: Layout herstructureren — invulvelden full-width, preview eronder

### Nieuwe layout

```
┌─────────────────────────────────────────────────┐
│  [Dashboard]                    [Bedrijf ▾]      │
└─────────────────────────────────────────────────┘
              Nieuwsbrief
    Genereer een op maat gemaakte...

┌──────────────────────┐  ┌──────────────────────┐
│  Bedrijfsnaam        │  │  Toon                │
│  Tagline             │  │  CTA tekst           │
│  Bedrijfsomschrijving│  │  CTA URL             │
│  Doelgroep           │  │  Website             │
│  RSS feeds           │  │  Huisstijl kleuren   │
└──────────────────────┘  └──────────────────────┘

              [Genereer nieuwsbrief]

┌─────────────────────────────────────────────────┐
│  HTML Preview                      [Downloaden] │
│                                                 │
│  <iframe ...>                                   │
└─────────────────────────────────────────────────┘
```

### Wijzigingen in `src/pages/Nieuwsbrief.tsx`

1. **Buitenste grid verwijderen** — geen `grid-cols-[400px_1fr]` meer
2. **Twee gelijke kolommen voor velden** — `grid grid-cols-2 gap-6` over de volledige breedte (`max-w-7xl`):
   - **Kolom 1 (Card)**: Bedrijfsnaam, Tagline, Bedrijfsomschrijving, Doelgroep + RSS feeds
   - **Kolom 2 (Card)**: Toon, CTA tekst, CTA URL, Website + Huisstijl kleuren
3. **Genereer-knop** eronder, full-width
4. **Preview Card** eronder op volledige breedte, iframe hoogte verhogen naar `700px`

### Bestanden
| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | Layout herstructureren: twee gelijke kolom-cards + preview eronder |

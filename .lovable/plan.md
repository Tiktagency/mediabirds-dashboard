
## Plan: Kleuren + Live Preview Naast Elkaar

### Huidige structuur
- Kolom 1: Bedrijfsinfo (velden 1-4) + RSS feeds
- Kolom 2: Toon/CTA velden (5-8) + Kleuren (onderaan)
- Genereer knop
- HTML Preview (full width onderaan)

### Nieuwe structuur

```
[ Kolom 1: Bedrijfsinfo + RSS feeds ]  [ Kolom 2: Toon/CTA velden ]

[ Kolom A: Kleuren + mode toggle ]     [ Kolom B: Live kleur preview ]

[ Genereer knop ]

[ HTML Preview ]
```

De kleuren worden uit kolom 2 gehaald en in een nieuw 2-koloms rij geplaatst:
- **Links**: apart vlak met de `Huisstijl kleuren` card (incl. custom/auto toggle)
- **Rechts**: live HTML preview van de nieuwsbrief layout gebouwd nadat de kleuren

### Live kleurpreview (rechterkolom)

Gebouwd als statische React component die de huidige `localColors` gebruikt. Structuur exact nagebouwd van de afbeelding:

1. **Intro tekst** — op `achtergrond_kleur` achtergrond, `tekst_kleur` tekst, cursieve subtekst `subtekst_kleur`
2. **Divider** — lijn in `primaire_kleur`
3. **1 AI-ontwikkeling** — kaart op `kaart_achtergrond`, badge in `primaire_kleur`, titel `tekst_kleur`, body `tekst_kleur`, italic MKB-tip in `primaire_kleur`
4. **1 AI-feitje** — sectie op `achtergrond_kleur` met emoji, vet `tekst_kleur`, italic feit `subtekst_kleur`
5. **CTA sectie** — achtergrond `secundaire_kleur`, tekst `footer_tekst_kleur`, knop in `primaire_kleur` met `cta_tekst_kleur`

Alles schaled mee als `localColors` verandert (geen debounce nodig, direct state).

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | Kleuren uit kolom 2 halen, 3e rij toevoegen met kleuren-card links + preview-card rechts |

Geen nieuwe files nodig — de preview is een inline component in Nieuwsbrief.tsx.


# Plan: HTML Code en Bedrijfslogo Vlakken Even Hoog Maken

## Huidige Situatie

- **HTML Code vlak** (rechterkolom): Heeft `min-h-[200px] max-h-[300px]` voor de code container
- **Afbeeldingen Card** (formulier): Bevat zowel Profielfoto als Bedrijfslogo velden, zonder vaste hoogte

## Oplossing

Pas de hoogte van de "Afbeeldingen" Card aan zodat deze gelijk is aan de HTML Code Card.

## Te Wijzigen Bestanden

### `src/components/email-signature/EmailSignatureForm.tsx`

**Regel 622** - Afbeeldingen Card hoogte instellen:

```tsx
// Van:
<Card className="bg-white/5 border-white/10">

// Naar:
<Card className="bg-white/5 border-white/10 min-h-[320px]">
```

Dit zorgt ervoor dat de Afbeeldingen card (met Profielfoto en Bedrijfslogo) dezelfde minimale hoogte heeft als de HTML Code card (die ~320px is inclusief header).

## Alternatieve Optie

Als je specifiek alleen het Bedrijfslogo invoerveld even hoog wilt als het HTML code tekstgebied, kan ik in plaats daarvan de `min-h-[200px]` toevoegen aan het invoerveld-gebied van het Bedrijfslogo.

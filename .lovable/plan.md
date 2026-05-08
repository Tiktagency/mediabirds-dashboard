
# Plan: HTML Code Uitlijnen met Afbeeldingen Sectie

## Probleem

De rechterkolom heeft twee cards (Preview en HTML Code) die bovenaan de kolom beginnen, terwijl de "Afbeeldingen" sectie (profielfoto en bedrijfslogo) onderaan het formulier staat. De gebruiker wil dat de HTML Code card verticaal uitgelijnd is met de Afbeeldingen card.

---

## Huidige Layout

```
Formulier (midden)          |  Rechterkolom
----------------------------|------------------
[Handtekening naam]         |  [Preview]
[Persoonlijke info]         |  [HTML Code]
[Social Links]              |
[Kleuren]                   |
[Afbeeldingen]              |  <-- niet uitgelijnd
[Submit knop]               |
```

---

## Gewenste Layout

```
Formulier (midden)          |  Rechterkolom
----------------------------|------------------
[Handtekening naam]         |  [Preview]
[Persoonlijke info]         |  (neemt beschikbare
[Social Links]              |   ruimte in)
[Kleuren]                   |
[Afbeeldingen]              |  [HTML Code] <-- uitgelijnd
[Submit knop]               |
```

---

## Oplossing

De Preview card krijgt `flex-1` zodat deze alle beschikbare ruimte inneemt en de HTML Code card naar beneden duwt, zodat deze op dezelfde hoogte komt als de Afbeeldingen sectie.

---

## Code Wijzigingen

**Bestand: `src/pages/EmailSignature.tsx`**

### Preview Card aanpassen (regel 82)

Van:
```tsx
<Card className="bg-white/5 border-white/10">
```

Naar:
```tsx
<Card className="bg-white/5 border-white/10 flex-1 flex flex-col">
```

### CardContent binnen Preview Card aanpassen (regel 86)

Van:
```tsx
<CardContent>
```

Naar:
```tsx
<CardContent className="flex-1">
```

---

## Resultaat

- De Preview card groeit om de beschikbare ruimte te vullen
- De HTML Code card wordt naar beneden geduwd
- De HTML Code card staat visueel op dezelfde hoogte als de Afbeeldingen sectie in het formulier

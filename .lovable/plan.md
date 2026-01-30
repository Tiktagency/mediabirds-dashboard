
# Plan: HTML Code Card Uitlijnen met Functie-veld

## Probleem

De huidige layout heeft het Preview-paneel als `flex-1` waardoor deze alle ruimte inneemt. De gebruiker wil:
- De HTML Code card hoger laten beginnen (op niveau van "Functie" veld)
- De HTML Code card laten eindigen op het niveau van "Afbeeldingen" sectie
- De Preview card alleen de ruimte gebruiken die nodig is

---

## Huidige vs Gewenste Layout

```
Formulier (midden)          |  Rechterkolom (huidig)    |  Rechterkolom (gewenst)
----------------------------|---------------------------|---------------------------
[Handtekening naam]         |                           |
[Voornaam / Achternaam]     |  [Preview                 |  [Preview - klein]
[Email]                     |   (flex-1, neemt          |
[Functie]         <---------|   alle ruimte)]           |  [HTML Code    
[Telefoonnummer]            |                           |   (flex-1, begint
[Website]                   |                           |    bij Functie)]
[Plaatsnaam]                |                           |
[Social Links]              |                           |
[Kleuren]                   |                           |
[Afbeeldingen]    <---------|  [HTML Code]              |   eindigt hier]
[Submit knop]               |                           |
```

---

## Oplossing

1. Verwijder `flex-1` van de Preview card - deze neemt dan alleen zijn natuurlijke hoogte
2. Voeg `flex-1` toe aan de HTML Code card zodat deze de resterende ruimte inneemt

---

## Code Wijzigingen

**Bestand: `src/pages/EmailSignature.tsx`**

### Preview Card - verwijder flex-grow (regel 82)

Van:
```tsx
<Card className="bg-white/5 border-white/10 flex-1 flex flex-col">
```

Naar:
```tsx
<Card className="bg-white/5 border-white/10">
```

### Preview CardContent - verwijder flex-1 (regel 86)

Van:
```tsx
<CardContent className="flex-1">
```

Naar:
```tsx
<CardContent>
```

### HTML Code Card - voeg flex-grow toe (regel 109)

Van:
```tsx
<Card className="bg-white/5 border-white/10">
```

Naar:
```tsx
<Card className="bg-white/5 border-white/10 flex-1 flex flex-col">
```

### HTML Code CardContent - voeg flex-1 toe (regel 120)

Van:
```tsx
<CardContent>
```

Naar:
```tsx
<CardContent className="flex-1 flex flex-col">
```

### HTML Code container - voeg flex-1 toe (regel 121)

Van:
```tsx
<div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[200px] max-h-[300px] overflow-auto">
```

Naar:
```tsx
<div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 flex-1 overflow-auto">
```

---

## Resultaat

- Preview card blijft compact bovenaan
- HTML Code card neemt de resterende ruimte in
- HTML Code card begint visueel op het niveau van het Functie veld
- HTML Code card eindigt op het niveau van de Afbeeldingen sectie


# Plan: HTML Code Kaart Uitlijnen met Formulier

## Doel

De HTML Code kaart **altijd** laten uitrekken (ook zonder gegenereerde HTML) zodat de onderkant op dezelfde Y-positie staat als de Profielfoto/Bedrijfslogo sectie.

## Wijzigingen

**Bestand:** `src/pages/EmailSignature.tsx`

### Stap 1: Grid items laten stretchen (regel 83)
```tsx
// Van:
<div className="grid grid-cols-1 md:grid-cols-[280px_1fr_1fr] gap-6 items-start">

// Naar:
<div className="grid grid-cols-1 md:grid-cols-[280px_1fr_1fr] gap-6 md:items-stretch items-start">
```

### Stap 2: Rechterkolom volledige hoogte (regel 117)
```tsx
// Van:
<div className="order-3 flex flex-col gap-4">

// Naar:
<div className="order-3 flex flex-col gap-4 h-full">
```

### Stap 3: HTML Code kaart flex-grow (regel 146)
```tsx
// Van:
<Card className="bg-white/5 border-white/10">

// Naar:
<Card className="bg-white/5 border-white/10 flex-1 flex flex-col">
```

### Stap 4: CardContent en code container uitrekken (regel 183)
```tsx
// Van:
<CardContent>
  <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[200px] max-h-[300px] overflow-auto">

// Naar:
<CardContent className="flex-1 flex flex-col">
  <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[200px] flex-1 overflow-auto">
```

## Resultaat

De HTML Code kaart staat **altijd** uitgelijnd met de onderkant van het formulier, ongeacht of er content is of niet. De `max-h-[300px]` wordt verwijderd zodat het vlak kan groeien.

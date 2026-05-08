
# Plan: Dashboard Tab Layout Uitlijning

## Overzicht

Dit plan zorgt voor een strak uitgelijnd grid in de Dashboard tab van het Admin Panel, waarbij de linker en rechter kolommen visueel synchroon blijven ongeacht de content.

## Huidige Situatie

De huidige layout heeft de volgende problemen:
- **TileOrganizer** (links) heeft variabele hoogte door de 3x3 tile grid + tekst
- **TileColorCustomizer** (rechts) groeit/krimpt met de inhoud
- Reset knoppen zijn niet uitgelijnd met de actieknoppen links
- Geen vaste hoogte synchronisatie tussen kolommen

## Oplossing

### Grid Structuur Aanpak

De eerste rij (TileOrganizer + TileColorCustomizer) krijgt:
1. **Gelijke kolomhoogtes** via CSS Grid `items-stretch`
2. **Flexbox vertical distribution** binnen TileColorCustomizer zodat de reset knoppen altijd onderaan staan
3. **Vaste minimum hoogte** voor de rechter kolom

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│  TileOrganizer                  │  TileColorCustomizer            │
│  ┌─────┬─────┬─────┐            │  ┌─────────────────────────────┐│
│  │Tile │Tile │Tile │            │  │  Preview tiles (h-14)       ││
│  ├─────┼─────┼─────┤            │  └─────────────────────────────┘│
│  │Tile │Tile │Tile │            │  ┌─────────────────────────────┐│
│  ├─────┼─────┼─────┤            │  │  Color inputs               ││
│  │Tile │Tile │Tile │            │  │  (flex-1 to fill space)     ││
│  └─────┴─────┴─────┘            │  │                             ││
│  "Klik op potlood..."           │  └─────────────────────────────┘│
│  ← baseline align →             │  [Reset]  [Reset] ← same line  │
└─────────────────────────────────┴─────────────────────────────────┘
```

## Te Wijzigen Bestanden

### 1. `src/components/admin/dashboard/DashboardTab.tsx`

**Wijzigingen:**
- Voeg `items-stretch` toe aan de grid container voor gelijke rijhoogtes
- Beide kolommen krijgen `h-full` voor volledige hoogte-fill

```typescript
// Huidige code (regel 40):
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Nieuwe code:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
```

### 2. `src/components/admin/dashboard/TileColorCustomizer.tsx`

**Wijzigingen:**
- Card krijgt `h-full` en `flex flex-col` voor volledige hoogte
- CardContent krijgt `flex-1 flex flex-col` voor flexibele inhoud
- Reset buttons wrapper krijgt `mt-auto` om ze naar beneden te duwen
- Verwijder `pt-1` van reset buttons (nu automatisch gespaced)

```typescript
// Card component (regel 26):
<Card className="bg-card/50 border-border/30 h-full flex flex-col">

// CardContent (regel 36):
<CardContent className="flex-1 flex flex-col">

// Reset buttons container (regel 123):
<div className="grid grid-cols-2 gap-3 mt-auto">
```

### 3. `src/components/admin/dashboard/TileOrganizer.tsx`

**Wijzigingen:**
- Card krijgt `h-full` voor consistente hoogte
- Geen structurele wijzigingen nodig, alleen hoogte synchronisatie

```typescript
// Card component (regel 337):
<Card className="bg-card/50 border-border/30 h-full">
```

## Technische Details

### CSS Grid Alignment
- `items-stretch` zorgt dat beide grid-items dezelfde hoogte krijgen (gebaseerd op de hoogste)
- `h-full` zorgt dat de Card componenten de volledige beschikbare hoogte gebruiken

### Flexbox Distribution
- `flex flex-col` op de Card maakt verticale layout
- `flex-1` op CardContent zorgt dat het de beschikbare ruimte vult
- `mt-auto` op de reset buttons duwt ze naar de onderkant

### Visuele Baseline
De reset knoppen in TileColorCustomizer zullen nu uitgelijnd zijn met de "Klik op het potlood..." tekst in TileOrganizer, waardoor een visuele baseline ontstaat.

## Implementatie Volgorde

1. Update DashboardTab.tsx - grid items-stretch
2. Update TileOrganizer.tsx - h-full op Card
3. Update TileColorCustomizer.tsx - flexbox structuur voor verticale verdeling

## Resultaat

Na implementatie:
- Linker en rechter panelen hebben exact dezelfde hoogte
- Reset knoppen staan op dezelfde visuele lijn als de footer-tekst links
- Consistent grid gevoel zonder variabele hoogtes
- Professionele, uitgelijnd dashboard settings interface

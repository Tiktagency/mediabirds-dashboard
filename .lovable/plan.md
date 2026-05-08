

## Gelijke hoogte linker en rechter kolom

### Probleem
De linker kolom (bedrijfsvelden + knop) en rechter kolom (animatiepaneel) hebben een verschillende hoogte. De `items-stretch` class op de parent flex container werkt al, maar de rechter kolom en het animatie-component vullen hun beschikbare ruimte niet op.

### Oplossing
Twee kleine aanpassingen:

1. **`src/pages/WordpressAltText.tsx`** (regel 203): Voeg `flex flex-col` toe aan de rechter kolom wrapper, zodat het kind-element kan stretchen.

2. **`src/components/wordpress-alt-text/AltTextAnimation.tsx`**: Voeg `flex flex-col` en `justify-between` toe aan de binnenste container, zodat de velden gelijkmatig verdeeld worden over de volledige hoogte. De outer div heeft al `h-full`.

### Technische details

**WordpressAltText.tsx regel 203:**
```
// Van:
<div className="w-full lg:w-72 flex-shrink-0">

// Naar:
<div className="w-full lg:w-72 flex-shrink-0 flex flex-col">
```

**AltTextAnimation.tsx:**
```
// Binnenste space-y-3 div aanpassen naar flex kolom met justify-between
// zodat de 4 velden gelijkmatig de volledige hoogte vullen
```

Dit zorgt ervoor dat beide kolommen exact dezelfde hoogte hebben dankzij de bestaande `items-stretch` op de parent.

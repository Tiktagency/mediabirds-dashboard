
## Analyse

**Probleem 1: Inconsistente kleurpicker UI**
In het project zijn twee stijlen van kleurpickers:
- **Stijl A (admin panel / ButtonColorCustomizer / BackgroundColorCustomizer)**: Kleine kleurstip (`w-8 h-8`) + naast een tekstveld met hex code. ✅ Correct — toont hex code.
- **Stijl B (Nieuwsbrief / ColorField component)**: Alleen een kleurstip, hex code staat los ernaast als `<span>`, geen editeerbaar tekstveld. ❌ Niet consistent.
- **Stijl C (BlogGenerationForm / ColorCustomizer)**: Grotere kleurstip (`w-12 h-10`) + tekstveld. ✅ Heeft hex code.
- **Stijl D (EmailSignatureForm)**: Alleen kleurstip zonder hex. ❌

De gewenste uniforme standaard is: **kleurstip + editeerbaar hex tekstveld naast elkaar**, precies zoals in `ButtonColorCustomizer` en `BackgroundColorCustomizer`.

**Probleem 2: Achtergrondkleur invulvelden**
Op de Nieuwsbrief pagina gebruiken de velden `bg-input/50` als achtergrond. In andere componenten zoals `BlogGenerationForm` en admin paneel worden `bg-background/50` of `bg-input/50` gebruikt. De gebruiker wil consistentie in alle invulvelden.

## Wat moet er aangepast worden

### 1. Nieuwsbrief pagina — `ColorField` component
De huidige `ColorField` heeft een verborgen `<input type="color">` achter een gekleurde div, met de hex als tekst-span. Dit vervangen door het standaardpatroon: kleine kleurstip + editeerbaar Input tekstveld.

### 2. `ColorCustomizer.tsx` (admin panel — impact kleuren)
Heeft al kleurstip + tekstveld (stijl C). Standaard patroon `w-8 h-8` maken ipv `w-12 h-10`.

### 3. `TileColorCustomizer.tsx` (admin panel — tile kleuren)
Heeft al `w-8 h-8` maar géén tekstveld naast de kleurstip — alleen een label. Tekstveld toevoegen.

### 4. `BlogGenerationForm.tsx` — AI afbeelding kleuren
Heeft `w-12 h-10` formaat + tekstveld. Formaat uniformeren naar `w-8 h-8`.

### 5. `EmailSignatureForm.tsx` — kleurvelden
Heeft alleen kleurstip zonder hex tekstveld. Hex tekstveld toevoegen.

### 6. Invulveld achtergrondkleur Nieuwsbrief
Alle `Input` en `Textarea` velden op de Nieuwsbrief pagina gebruiken `bg-input/50`. Dit is al consistent met andere pagina's in het project — dit hoeft niet aangepast te worden. Alleen de kleurpicker velden moeten consistent worden.

## Bestanden die worden aangepast

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | `ColorField` component herschrijven: verborgen `<input type="color">` vervangen door `w-8 h-8` kleurstip + editeerbaar hex `Input` tekstveld (standaardpatroon) |
| `src/components/admin/dashboard/ColorCustomizer.tsx` | `w-12 h-10` → `w-8 h-8` voor kleurstip |
| `src/components/admin/dashboard/TileColorCustomizer.tsx` | Hex tekstveld toevoegen naast elke kleurstip |
| `src/components/seo-blog/BlogGenerationForm.tsx` | Kleurstippen uniformeren naar `w-8 h-8` |
| `src/components/email-signature/EmailSignatureForm.tsx` | Hex tekstveld toevoegen naast de kleurstip voor alle 3 kleurvelden |

## Standaard kleurpicker patroon (resultaat)

```tsx
// Uniform patroon in het hele project:
<div className="flex items-center gap-2">
  <Input
    type="color"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
  />
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 bg-background/50 font-mono text-sm"
    placeholder="#000000"
  />
</div>
```

Kleurstip: `w-8 h-8`, pad `p-0.5`, cursor pointer.  
Hex tekstveld: `flex-1`, `bg-background/50`, `font-mono text-sm`.

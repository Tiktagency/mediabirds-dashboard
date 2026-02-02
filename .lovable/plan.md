
# Plan: Button Hover Contrast Fix

## Probleem

De `outline` en `ghost` button variants in `src/components/ui/button.tsx` gebruiken `hover:text-accent-foreground` voor de hover state. In het huidige donkere thema is `accent-foreground` gedefinieerd als `0 0% 7%` (bijna zwart), waardoor tekst onleesbaar wordt bij hover.

---

## Oplossing

### 1. Aanpassen van button.tsx variants

**Bestand:** `src/components/ui/button.tsx`

| Variant | Huidige hover | Nieuwe hover |
|---------|---------------|--------------|
| `outline` | `hover:bg-accent hover:text-accent-foreground` | `hover:bg-white/10` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | `hover:bg-white/10` |

De tekstkleur wordt niet gewijzigd bij hover, zodat de originele tekstkleur behouden blijft.

### 2. Opruimen van redundante classes

Buttons die nu handmatige overrides hebben zoals `hover:text-white hover:bg-white/10` kunnen vereenvoudigd worden na de fix.

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/ui/button.tsx` | Hover states voor `outline` en `ghost` variants |
| `src/components/seo-blog/PageUrlForm.tsx` | Verwijder redundante hover classes |
| `src/pages/AdminPanel.tsx` | Voeg `hover:text-white` toe waar nodig |
| `src/components/seo/CompanySelector.tsx` | Verwijder redundante hover classes |

---

## Technische Details

**Huidige button variants (regels 15-19):**
```typescript
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
ghost: "hover:bg-accent hover:text-accent-foreground",
```

**Nieuwe button variants:**
```typescript
outline: "border border-input bg-background hover:bg-white/10",
ghost: "hover:bg-white/10",
```

Dit zorgt ervoor dat:
- De achtergrond subtiel oplicht bij hover
- De tekstkleur ongewijzigd blijft (wit blijft wit)
- Alle knoppen consistent gedrag vertonen

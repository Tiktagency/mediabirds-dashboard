
# Plan: Email Handtekening Tile Kleur Fix

## Probleem

De "Email Handtekening" tile in het admin panel Dashboard instellingen is donker gekleurd omdat deze niet is opgenomen in de `tileConfig` mapping. Hierdoor krijgt de tile een `muted` variant (donkere achtergrond) in plaats van de standaard tile kleuren.

## Oorzaak

In `src/components/admin/dashboard/TileOrganizer.tsx` is er een `tileConfig` object dat bepaalt welk icoon en welke kleurvariant elke tile krijgt:

```typescript
const tileConfig: Record<string, { icon: LucideIcon; variant: 'primary' | 'secondary' | 'accent' | 'muted' }> = {
  'saved-hours': { icon: Clock, variant: 'primary' },
  'monday-planning': { icon: CalendarDays, variant: 'primary' },
  'seo-blog': { icon: FileText, variant: 'accent' },
  'wordpress-alt-text': { icon: Image, variant: 'primary' },
  'chatbot': { icon: MessageCircle, variant: 'secondary' },
  'copyright-branding': { icon: Sparkles, variant: 'accent' },
  // 'email-handtekening' ONTBREEKT!
};
```

Wanneer een tile niet in deze config staat, valt deze terug op:
```typescript
const config = tileConfig[id] || { icon: BarChart3, variant: 'muted' as const };
```

De `muted` variant gebruikt donkere Tailwind kleuren (`bg-muted text-muted-foreground`) in plaats van de gebruiker-gedefinieerde tile kleuren.

## Oplossing

1. Voeg `email-handtekening` toe aan de `tileConfig` met een passend icoon (`Mail`) en `primary` variant
2. Wijzig de fallback variant van `muted` naar `primary`, zodat nieuwe tiles automatisch de juiste kleuren krijgen

## Wijzigingen

### `src/components/admin/dashboard/TileOrganizer.tsx`

**Wijziging 1 - Import Mail icoon toevoegen (regel 21):**
```typescript
import { GripVertical, LayoutGrid, Pencil, CalendarDays, Search, FileText, Image, MessageCircle, Clock, BarChart3, Sparkles, Mail, LucideIcon } from 'lucide-react';
```

**Wijziging 2 - Email Handtekening toevoegen aan tileConfig (regel 55-62):**
```typescript
const tileConfig: Record<string, { icon: LucideIcon; variant: 'primary' | 'secondary' | 'accent' | 'muted' }> = {
  'saved-hours': { icon: Clock, variant: 'primary' },
  'monday-planning': { icon: CalendarDays, variant: 'primary' },
  'seo-blog': { icon: FileText, variant: 'accent' },
  'wordpress-alt-text': { icon: Image, variant: 'primary' },
  'chatbot': { icon: MessageCircle, variant: 'secondary' },
  'copyright-branding': { icon: Sparkles, variant: 'accent' },
  'email-handtekening': { icon: Mail, variant: 'primary' },
};
```

**Wijziging 3 - Fallback variant wijzigen naar primary (regel 106):**
```typescript
const config = tileConfig[id] || { icon: BarChart3, variant: 'primary' as const };
```

## Resultaat

- De "Email Handtekening" tile krijgt nu dezelfde achtergrondkleur als de andere tiles
- Nieuwe tiles die in de toekomst worden toegevoegd zullen automatisch de standaard tile kleuren gebruiken (primary variant)
- Het Mail icoon past bij de functionaliteit van de email handtekening feature

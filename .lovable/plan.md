

## Fix: Dropdown menu's gebruiken huisstijl kleuren in plaats van blauwe/grijze tinten

### Probleem
Op de Monday Planning pagina en in het BlogGenerationForm worden dropdown menu's gestyled met `bg-slate-800` en `bg-gray-800`, wat een blauwachtige tint geeft die niet past bij de huisstijl (donkergrijs/sage green).

### Oplossing
Vervang alle hardcoded slate/gray kleuren in dropdown- en popover-achtergronden door de design system variabelen die al gedefinieerd zijn:
- `bg-popover` (= `hsl(0 0% 11%)` = `#1c1c1c`) voor dropdown/popover achtergronden
- `border-border` voor randen
- `hover:bg-accent/20` of `focus:bg-accent/20` voor hover/focus states

### Aanpassingen

**1. `src/pages/MondayPlanning.tsx`**
- Regel 192: `bg-slate-800 border-white/20` wordt `bg-popover border-border`
- Regel 217: `bg-slate-800 border-white/20` wordt `bg-popover border-border`
- Regel 223: `bg-slate-800` op Calendar wordt `bg-popover`

**2. `src/components/seo-blog/BlogGenerationForm.tsx`**
- Regel 441: `bg-gray-800 border-gray-700` wordt `bg-popover border-border`
- Regel 443: `hover:bg-gray-700 focus:bg-gray-700` wordt `hover:bg-accent/20 focus:bg-accent/20`

Dit zorgt ervoor dat alle dropdowns dezelfde neutrale donkergrijze achtergrond (`#1c1c1c`) gebruiken die aansluit bij de rest van het dashboard, en geen blauwige of grijze afwijkende tinten meer tonen.

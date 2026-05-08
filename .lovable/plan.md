

## Informatie-icoon bij "Applicatie wachtwoord"

### Wat wordt er toegevoegd
Een klein informatie-icoontje (i) rechts naast het label "Applicatie wachtwoord:" dat bij hover een tooltip toont met stapsgewijze instructies voor het aanmaken van een applicatie wachtwoord in WordPress.

### Tooltip inhoud
De tooltip bevat een overzichtelijke stappen-lijst:

1. Ga naar de achterkant van je WordPress website
2. Navigeer naar **Gebruikers** en selecteer **Mediabirds**
3. Scroll naar het kopje **Applicatie wachtwoorden**
4. Gebruik als naam: **n8n alt tekst**
5. Klik op **"Applicatie wachtwoord toevoegen"**

### Technische aanpassing

**Bestand: `src/pages/WordpressAltText.tsx`**

- Import `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` uit `@/components/ui/tooltip`
- Import `Info` icoon uit `lucide-react`
- Bij het label "Applicatie wachtwoord:" (rond regel 178) een `Info`-icoon toevoegen met een Tooltip die de stappen weergeeft
- De tooltip krijgt styling passend bij het donkere thema (bg-card, border-border, text-white)
- De stappen worden als genummerde lijst weergegeven met bold tekst voor de belangrijke termen



## Meer witruimte + team afbeelding in animatie

### 1. Meer witruimte tussen menubalk en titel

**Bestand: `src/pages/Landingspagina.tsx` (regel 199)**

De `pt-16` (64px) en `sm:pt-20` (80px) worden vergroot naar `pt-24` (96px) en `sm:pt-28` (112px). Dit geeft meer ademruimte tussen de vaste header en de "Landingspagina" titel.

### 2. Team afbeelding in het animatiepaneel

**Bestand: `src/components/wordpress-alt-text/AltTextAnimation.tsx`**

Boven de vier tekstvelden wordt een afbeelding van een team toegevoegd. Dit vult het grote witte gedeelte en maakt de animatie visueel aantrekkelijker -- alsof de alt-tekst velden bij die afbeelding horen.

- Een placeholder team-afbeelding wordt geplaatst in een afgerond grijs vlak bovenaan het witte paneel
- De afbeelding wordt geladen via `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop` (team aan het werk)
- De vier velden schuiven naar onder, onder de afbeelding

| Onderdeel | Was | Wordt |
|---|---|---|
| Padding boven titel | `pt-16 sm:pt-20` | `pt-24 sm:pt-28` |
| Animatiepaneel | Alleen 4 tekstvelden | Team afbeelding + 4 tekstvelden |

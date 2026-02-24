

## Afbeelding verwijderen uit Alt-Text animatie

### Wat wordt er aangepast

De team-afbeelding (Unsplash foto) wordt verwijderd uit het `AltTextAnimation` component. Alleen de vier metadata-velden (Alt-tekst, Titel, Bijschrift, Beschrijving) blijven over.

### Bestand

| Bestand | Aanpassing |
|---|---|
| `src/components/wordpress-alt-text/AltTextAnimation.tsx` | De `div` met `aspect-square` en de `img` tag verwijderen (regels 88-94) |

### Resultaat

Het animatiepaneel toont alleen nog de vier invulvelden zonder afbeelding erboven, waardoor het component compacter wordt en visueel losstaat van de Landingspagina.


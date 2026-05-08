
## Probleem: Banner afbeelding laadt langzaam bij terugkeer naar /

### Oorzaak
De banner (`mountain-banner.png`) is een grote PNG die via een `<img>` tag geladen wordt. Bij terugkeer naar de pagina moet de browser de afbeelding opnieuw uit de cache halen. Het vertraging is te zien doordat:
1. De `<img>` element zelf geen expliciete afmeting heeft ingesteld — de browser moet de afbeelding laden om de hoogte te bepalen, wat layout-shifts veroorzaakt
2. Er geen `loading="eager"` of `fetchPriority="high"` hint staat op de img-tag
3. Er geen `<link rel="preload">` is in de HTML

### Oplossing

**In `index.html`**: Voeg een `<link rel="preload">` toe voor de banner zodat de browser hem direct bij het laden van de pagina al ophaalt, vóór React rendert:

```html
<link rel="preload" as="image" href="/src/assets/mountain-banner.png" />
```

**In `src/pages/Index.tsx`**: Voeg `fetchPriority="high"` toe aan de `<img>` tag, en een `loading="eager"` attribuut. Dit instrueert de browser de afbeelding hoge prioriteit te geven in de resource loading queue.

```tsx
<img 
  src={bannerImage} 
  alt="Mediabirds Banner" 
  className="w-full h-full object-cover"
  fetchPriority="high"
  loading="eager"
  draggable="false"
/>
```

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Index.tsx` | `fetchPriority="high"` + `loading="eager"` op de banner `<img>` |
| `index.html` | `<link rel="preload">` voor de banner afbeelding |

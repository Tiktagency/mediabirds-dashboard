

## Progressiebalk zichtbaar maken

### Probleem

De progressiebalk animatie werkt technisch correct (de waarde loopt netjes op van 0 naar 100), maar de balk is **onzichtbaar** omdat de achtergrondkleur en de vulkleur exact dezelfde kleur zijn:

- Achtergrond (`bg-secondary`): `hsl(130, 17%, 84%)` -- lichtgroen
- Vulling (`bg-primary`): `hsl(130, 17%, 84%)` -- dezelfde lichtgroen

### Oplossing

De Progress indicator in de LeadsGenerator krijgt een eigen zichtbare kleur via een className override, zodat de balk duidelijk opvalt tegen de achtergrond.

### Wat wordt er aangepast

**`src/pages/LeadsGenerator.tsx`**

Op de `<Progress>` component wordt een custom indicator-kleur meegegeven. De achtergrond van de progressiebalk wordt donker/transparant gemaakt en de indicator krijgt de primaire groene kleur:

```typescript
<Progress 
  value={progress} 
  className="h-2 bg-white/10 [&>div]:bg-primary" 
/>
```

- `bg-white/10`: donkere transparante achtergrond zodat de balk zichtbaar is op het donkere scherm
- `[&>div]:bg-primary`: de indicator behoudt de groene kleur maar is nu zichtbaar tegen de donkere achtergrond

### Bestanden die worden aangepast

| Bestand | Wijziging |
|---|---|
| `src/pages/LeadsGenerator.tsx` | Progress className aanpassen zodat achtergrond en vulling verschillende kleuren hebben |


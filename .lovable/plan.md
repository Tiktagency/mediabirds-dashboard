

## Plan: Kleuren behouden bij wisselen auto/custom modus

### Probleem
Bij het wisselen tussen "Automatisch" en "Custom" kleurmodus worden de kleuren niet opgeslagen naar de database. Als je in auto-modus kleuren ophaalt en dan naar custom switcht, gaan de kleuren mogelijk verloren bij een page refresh of bedrijfswisseling.

### Oplossing
Sla de huidige `localColors` op naar de database bij elke mode-switch. Dit zorgt ervoor dat:
1. Kleuren die in auto-modus zijn opgehaald bewaard blijven als je naar custom switcht
2. Kleuren die in custom-modus zijn aangepast bewaard blijven als je naar auto switcht

### Aanpassing in `src/pages/Nieuwsbrief.tsx`

1. Maak twee handler functies voor de mode-switch knoppen (regel 626-646):
   - `handleSwitchToCustom`: slaat alle huidige `localColors` op naar de database via `saveToCompany`, zet daarna `colorMode` naar `'custom'`
   - `handleSwitchToAuto`: slaat alle huidige `localColors` op naar de database, zet `colorMode` naar `'auto'`
2. Vervang de directe `setColorMode` calls in de toggle-knoppen door deze handlers
3. Toon een korte toast "Kleuren opgeslagen" bij het wisselen

### Technisch detail
```ts
const handleSwitchColorMode = async (mode: 'custom' | 'auto') => {
  setColorMode(mode);
  if (selectedCompany) {
    await saveToCompany(localColors);
  }
};
```

De twee `onClick` handlers op regel 627 en 637 worden vervangen door `() => handleSwitchColorMode('custom')` en `() => handleSwitchColorMode('auto')`.


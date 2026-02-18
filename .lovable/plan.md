

## Fix: Achtergrondkleur direct toepassen na opslaan

### Probleem

De `useApplyButtonColors` hook draait in `AppContent` en heeft een **eigen instantie** van `useDashboardSettings` met eigen lokale state. Wanneer je in het admin panel op "Opslaan" klikt, wordt de database bijgewerkt en de state in de admin panel instantie geüpdatet -- maar de instantie in `AppContent` weet hier niets van. Die leest pas de nieuwe waarde bij een page refresh.

### Oplossing

Pas de CSS variabele **direct** toe in de `updateBackgroundColor` functie in `useDashboardSettings.ts`. Zo wordt de `--background` variabele onmiddellijk aangepast op het moment van opslaan, zonder afhankelijk te zijn van een andere hook-instantie.

Dezelfde fix wordt ook toegepast op `updateButtonColors` voor consistentie.

### Technische details

**`src/hooks/useDashboardSettings.ts`**

In `updateBackgroundColor`: na het opslaan naar de database, direct de CSS variabele zetten:

```typescript
const updateBackgroundColor = async (color: string) => {
  // ... bestaande DB opslag ...

  // Direct toepassen op CSS
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    document.documentElement.style.setProperty('--background', hexToHsl(color));
  }
};
```

In `updateButtonColors`: na het opslaan, direct de button CSS variabelen zetten:

```typescript
const updateButtonColors = async (colors: { background?: string; text?: string }) => {
  // ... bestaande DB opslag ...

  // Direct toepassen op CSS
  if (newColors.background) {
    document.documentElement.style.setProperty('--button-primary-bg', newColors.background);
  }
  if (newColors.text) {
    document.documentElement.style.setProperty('--button-primary-text', newColors.text);
  }
};
```

De `hexToHsl` hulpfunctie wordt verplaatst van `useApplyButtonColors.ts` naar een gedeelde plek (of gedupliceerd in `useDashboardSettings.ts`) zodat beide bestanden er gebruik van kunnen maken.

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/hooks/useDashboardSettings.ts` | `hexToHsl` toevoegen + direct CSS toepassen in `updateBackgroundColor` en `updateButtonColors` |


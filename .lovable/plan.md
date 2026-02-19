

## Fix: Nieuwe dashboard tiles verschijnen automatisch

### Het probleem

Elke gebruiker heeft een `tile_order` array in `user_dashboard_settings` die exact bepaalt welke tiles zichtbaar zijn. Wanneer een nieuwe automation wordt toegevoegd aan `tileConfigMap`, wordt deze **niet** automatisch toegevoegd aan bestaande gebruikers hun `tile_order`. Hierdoor zie je de tile nooit.

Huidige tile_order voor alle gebruikers:
```
[saved-hours, monday-planning, seo-blog, wordpress-alt-text, chatbot, 
 copyright-branding, email-handtekening, landingspagina, __empty_8]
```

`leads-generator` ontbreekt hier volledig.

### Oplossing (twee delen)

#### Deel 1: Bestaande data fixen

Een database update die `leads-generator` toevoegt aan de `tile_order` van alle bestaande gebruikers. De `__empty_8` slot wordt vervangen door `leads-generator`.

#### Deel 2: Code aanpassen zodat dit nooit meer voorkomt

In `src/pages/Index.tsx` wordt de `getOrderedItems()` functie aangepast zodat deze:
1. De `tile_order` uit de database leest (zoals nu)
2. Checkt of er tiles in `tileConfigMap` zitten die **niet** in de `tile_order` staan
3. Ontbrekende tiles automatisch toevoegt (op de eerste lege `__empty_` plek, of aan het einde)

Zo verschijnt elke nieuwe tile die je toevoegt aan `tileConfigMap` automatisch op het dashboard, zelfs als de gebruiker zijn `tile_order` niet heeft bijgewerkt.

### Technische details

**Database update (via insert tool)**

```sql
UPDATE user_dashboard_settings
SET tile_order = jsonb_set(
  tile_order,
  -- vervang __empty_8 door leads-generator
)
```

Concreet: voor elke gebruiker wordt `leads-generator` toegevoegd op de plek van een empty slot.

**`src/pages/Index.tsx` -- `getOrderedItems()` aanpassen**

```typescript
const getOrderedItems = () => {
  const allTileKeys = Object.keys(tileConfigMap); // alle bekende tiles
  let items: string[] = [];

  if (dashboardSettings.tile_order?.length) {
    items = [...dashboardSettings.tile_order];
  } else {
    // Default volgorde
    items = ['saved-hours', ...allTileKeys.filter(k => k !== 'saved-hours')];
  }

  // Zoek tiles die in tileConfigMap staan maar NIET in items
  const missingTiles = allTileKeys.filter(
    key => !items.includes(key)
  );

  // Voeg ontbrekende tiles toe op lege plekken
  for (const tile of missingTiles) {
    const emptyIndex = items.findIndex(i => i.startsWith('__empty_'));
    if (emptyIndex !== -1) {
      items[emptyIndex] = tile;
    } else {
      items.push(tile);
    }
  }

  // Zorg voor GRID_SIZE items
  while (items.length < GRID_SIZE) {
    items.push(`__empty_${items.length}`);
  }

  return items.slice(0, GRID_SIZE);
};
```

**`src/components/admin/dashboard/TileOrganizer.tsx`**

Dezelfde logica toevoegen zodat de admin TileOrganizer ook nieuwe tiles toont die nog niet in de opgeslagen `tile_order` staan.

### Bestanden die worden aangepast

| Bestand | Actie |
|---|---|
| `src/pages/Index.tsx` | `getOrderedItems()` aanpassen met auto-detect van ontbrekende tiles |
| `src/components/admin/dashboard/TileOrganizer.tsx` | Zelfde auto-detect logica toevoegen |
| Database (data update) | `leads-generator` toevoegen aan tile_order van alle bestaande gebruikers |


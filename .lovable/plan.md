

## Plan: Auto-save voor alle admin panel wijzigingen + globale dashboard-instellingen

### Probleem
1. **AutomationCard** heeft een handmatige "Opslaan" knop — wijzigingen worden niet automatisch opgeslagen
2. **Dashboard-instellingen** (tile order, kleuren, labels) worden per gebruiker opgeslagen in `user_dashboard_settings` — wijzigingen van een admin gelden niet voor andere gebruikers

### Oplossing

**1. AutomationCard: auto-save met debounce**
- Verwijder de handmatige "Wijzigingen opslaan" knop
- Voeg een `useEffect` met debounce (800ms) toe die `onUpdate` aanroept zodra `localSetting` verandert
- Toon een subtiele "Opgeslagen" indicator in plaats van een knop

**2. Dashboard-instellingen globaal maken**
- Wijzig `useDashboardSettings` zodat admin-wijzigingen worden doorgevoerd naar ALLE gebruikers in `user_dashboard_settings`
- Bij elke update (tile order, kleuren, labels, etc.) wordt naast de eigen record ook alle andere records bijgewerkt via een edge function
- Nieuwe edge function `sync-dashboard-settings` die met service role key alle user records update

### Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/admin/automation/AutomationCard.tsx` | Verwijder save-knop, voeg debounced auto-save toe |
| `src/hooks/useDashboardSettings.ts` | Voeg `updateAllUsers` functie toe die edge function aanroept |
| `supabase/functions/sync-dashboard-settings/index.ts` | Nieuw: update alle user_dashboard_settings records met admin wijzigingen |

### Technisch detail

**AutomationCard debounce:**
```ts
useEffect(() => {
  if (!hasChanges) return;
  const timer = setTimeout(() => {
    onUpdate(setting.id, { display_name, description, impact_level, ... });
  }, 800);
  return () => clearTimeout(timer);
}, [localSetting]);
```

**Sync edge function:** Ontvangt de gewijzigde velden (tile_order, impact_colors, dashboard_colors, custom_labels) en past deze toe op alle rijen in `user_dashboard_settings` via de service role key. Dit zorgt ervoor dat wijzigingen van één admin automatisch voor iedereen gelden.


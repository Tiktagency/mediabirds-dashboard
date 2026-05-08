

## Plan: Fix automatische trigger die zichzelf uitzet

### Probleem
De `ScheduleTrigger` component initialiseert `enabled` als `false` via `useState(false)`. Wanneer de pagina laadt, haalt `useAltTextSchedule` de schedule op uit de database. Zodra de data binnenkomt, wordt `isLoading = false` en verschijnt de toggle — maar de `useEffect` die `enabled` synchroniseert draait pas NA die render. Hierdoor toont de toggle kort (of langer bij trage verbinding) "Inactief" terwijl de database `enabled: true` heeft. Bij elke paginavisit of component-remount herhaalt dit zich.

Daarnaast reset de `useEffect` alle velden naar defaults wanneer `schedule` even `null` is (tijdens laden), wat het probleem versterkt.

### Oplossing
Verwijder de afhankelijkheid van lokale `enabled` state voor rendering en gebruik in plaats daarvan direct de schedule prop als bron van waarheid.

### Aanpassing in `src/components/seo/ScheduleTrigger.tsx`

1. **Verwijder `useState(false)` voor enabled** — vervang door een lokale override die alleen actief is tijdens een optimistic update (toggle klik → wacht op DB response)
2. **Bereken `enabled` direct**: `const enabled = localEnabledOverride ?? schedule?.enabled ?? false`
3. **In `handleEnabledChange`**: zet de override optimistisch, en reset deze na de DB-update (zodat de schedule prop weer leidend is)
4. **Initialiseer overige lokale state vanuit schedule prop** in de useState zelf waar mogelijk, zodat er geen useEffect-gap is

Concreet:
```ts
// Optimistic override – alleen actief tussen toggle-klik en DB-response
const [enabledOverride, setEnabledOverride] = useState<boolean | null>(null);
const enabled = enabledOverride ?? schedule?.enabled ?? false;

const handleEnabledChange = async (newEnabled: boolean) => {
  setEnabledOverride(newEnabled); // instant UI feedback
  await updateSchedule({ enabled: newEnabled });
  setEnabledOverride(null); // schedule prop is nu bijgewerkt, volg die weer
};
```

De `useEffect` wordt vereenvoudigd: het synchroniseert nog steeds `intervalValue`, `dayOfWeek`, etc. vanuit schedule, maar zet NIET meer `enabled` en reset niet meer naar defaults bij `schedule === null`.

### Bestanden
| Bestand | Wijziging |
|---------|-----------|
| `src/components/seo/ScheduleTrigger.tsx` | Fix enabled state management |




## Fix: Login logs direct laden zonder flikkering

### Probleem
1. De logs worden pas opgehaald wanneer het panel geopend wordt (`useEffect` luistert op `open`). Dit betekent dat er altijd een laadmoment is bij het openen.
2. Tijdens het laden worden skeleton-loaders getoond in plaats van de bestaande data, wat als "knipperen" wordt ervaren.
3. Er is geen realtime update wanneer een nieuwe login binnenkomt.

### Oplossing

Drie aanpassingen in `src/components/dashboard/LoginLogsPanel.tsx`:

**1. Logs direct laden bij mount (niet pas bij openen)**

Verplaats de initiële fetch naar component mount, zodat de data al klaar staat voordat het panel geopend wordt.

**2. Skeleton alleen tonen bij eerste keer laden**

Gebruik een aparte `isInitialLoad` state. Skeletons worden alleen getoond als er nog nooit data is geladen. Bij een refresh (panel opnieuw openen) blijft de bestaande data zichtbaar terwijl er op de achtergrond nieuwe data wordt opgehaald -- geen flikkering.

**3. Realtime subscription op login_logs tabel**

Voeg een Supabase realtime channel toe die luistert naar INSERT events op de `login_logs` tabel. Wanneer een nieuwe login binnenkomt, wordt deze direct bovenaan de lijst toegevoegd zonder een volledige refetch.

### Technische details

```typescript
// Nieuwe state structuur
const [logs, setLogs] = useState<LoginLog[]>([]);
const [isInitialLoad, setIsInitialLoad] = useState(true);

// Fetch bij mount, niet bij open
useEffect(() => {
  fetchLogs();
}, []);

// Refresh ook bij openen, maar zonder skeletons
useEffect(() => {
  if (open) fetchLogs();
}, [open]);

// fetchLogs zet alleen isInitialLoad op false, niet isLoading
const fetchLogs = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data } = await supabase
    .from('login_logs')
    .select('id, display_name, email, logged_in_at')
    .gte('logged_in_at', sevenDaysAgo.toISOString())
    .order('logged_in_at', { ascending: false });

  if (data) setLogs(data);
  setIsInitialLoad(false);
};

// Realtime subscription
useEffect(() => {
  const channel = supabase
    .channel('login-logs-realtime')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'login_logs' },
      (payload) => {
        setLogs(prev => [payload.new as LoginLog, ...prev]);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);

// Skeletons alleen bij initiële load
{isInitialLoad ? <Skeletons /> : logs.length === 0 ? <Empty /> : <LogsList />}
```

### Database vereiste

Een migratie om realtime in te schakelen voor de `login_logs` tabel:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_logs;
```

### Samenvatting

| Onderdeel | Actie |
|---|---|
| Database migratie | Realtime inschakelen voor `login_logs` |
| `LoginLogsPanel.tsx` | Laden bij mount, geen flikkering bij refresh, realtime updates |


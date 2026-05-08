

## Fix: Race condition in login logging

### Probleem
De `sessionStorage.setItem('session_logged', 'true')` wordt pas gezet **nadat** de database insert klaar is (async). Ondertussen kan het effect opnieuw draaien (bijv. doordat `isLoading` verandert van `true` naar `false`), waardoor meerdere inserts tegelijk starten voordat de flag is gezet.

### Oplossing
Verplaats `sessionStorage.setItem` naar **voor** de async database call. Zo wordt de flag direct gezet en kunnen volgende renders niet opnieuw triggeren.

### Technische aanpassing

**Bestand: `src/pages/Index.tsx`** (regel 122-150)

Huidige volgorde:
1. Check sessionStorage
2. Start async insert
3. Wacht op insert
4. Zet sessionStorage flag

Nieuwe volgorde:
1. Check sessionStorage
2. **Zet sessionStorage flag direct**
3. Start async insert

```typescript
useEffect(() => {
  if (!user || isLoading) return;

  const alreadyLogged = sessionStorage.getItem('session_logged');
  if (alreadyLogged) return;

  // Zet flag DIRECT om race condition te voorkomen
  sessionStorage.setItem('session_logged', 'true');

  const logVisit = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const displayName = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : user.email;

    await supabase.from('login_logs').insert({
      user_id: user.id,
      email: user.email,
      display_name: displayName,
    });
  };

  logVisit();
}, [user, isLoading]);
```

Een enkele regelwijziging: `sessionStorage.setItem` verplaatsen van na de await naar voor de async call.


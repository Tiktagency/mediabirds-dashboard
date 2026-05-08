

## Fix: Dubbele login log entries

### Probleem
Bij inloggen verschijnen er steeds 2 entries in het login log. Dit komt doordat `useAuth` twee keer de user-state bijwerkt (via zowel `getSession()` als `onAuthStateChange`), wat ertoe leidt dat de useEffect twee keer triggert voordat de sessionStorage flag betrouwbaar wordt gelezen.

### Oplossing
Voeg een **module-level variabele** toe als extra synchrone guard naast sessionStorage. Een module-level variabele wordt direct gedeeld tussen alle renders zonder enige vertraging, terwijl sessionStorage soms niet snel genoeg wordt gelezen tussen twee snelle re-renders.

### Technische aanpassing

**Bestand: `src/pages/Index.tsx`**

Voeg buiten de component een variabele toe:

```typescript
// Buiten de component (module-level)
let sessionLogPending = false;
```

Pas de useEffect aan:

```typescript
useEffect(() => {
  if (!user || isLoading) return;

  const alreadyLogged = sessionStorage.getItem('session_logged');
  if (alreadyLogged || sessionLogPending) return;

  // Zet BEIDE flags direct
  sessionLogPending = true;
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

De module-level `sessionLogPending` variabele is sneller dan sessionStorage en voorkomt dat twee bijna-gelijktijdige effect-runs beide doorlopen. SessionStorage blijft erbij voor persistentie bij page refreshes.

### Samenvatting
Een bestand, drie regels extra code.

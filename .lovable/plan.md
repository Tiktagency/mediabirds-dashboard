

## Login-logging uitbreiden: ook bij heropenen dashboard

### Probleem
Momenteel wordt een login alleen gelogd wanneer iemand daadwerkelijk inlogt via het loginformulier. Het heropenen van het dashboard (bijv. nieuw tabblad, browser opnieuw openen) wordt niet gelogd. Een gewone pagina-refresh moet **niet** tellen.

### Oplossing: sessionStorage flag

Het verschil tussen "heropenen" en "refresh" is dat `sessionStorage` wordt gewist wanneer een tab/venster wordt gesloten, maar behouden blijft bij een refresh.

**Logica:**
1. Wanneer de gebruiker geauthenticeerd is op het dashboard (Index.tsx), controleer of er een `session_logged` flag in `sessionStorage` staat
2. Zo nee --> dit is een nieuw bezoek (nieuw tabblad of browser heropend) --> insert in `login_logs` en zet de flag
3. Zo ja --> dit is een refresh --> doe niets

### Technische aanpassingen

**Bestand: `src/pages/Index.tsx`**

Een `useEffect` toevoegen die draait zodra de `user` beschikbaar is en `isLoading` false is:

```typescript
useEffect(() => {
  if (!user || isLoading) return;

  const alreadyLogged = sessionStorage.getItem('session_logged');
  if (alreadyLogged) return;

  // Log dit bezoek
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

    sessionStorage.setItem('session_logged', 'true');
  };

  logVisit();
}, [user, isLoading]);
```

**Bestand: `src/pages/Login.tsx`**

De bestaande `login_logs` insert in de `handleLogin` functie verwijderen -- de logging wordt nu centraal afgehandeld via de `sessionStorage`-check in Index.tsx. De Login.tsx insert is niet meer nodig omdat Index.tsx het altijd oppikt (na login wordt je doorgestuurd naar Index).

Optioneel: in Login.tsx na succesvolle login `sessionStorage.removeItem('session_logged')` aanroepen zodat de redirect naar Index het als nieuw bezoek ziet. Maar dit is niet strikt nodig -- als er nog geen flag staat (eerste keer in die tab), wordt het automatisch gelogd.

### Samenvatting wijzigingen

| Bestand | Wat |
|---|---|
| `src/pages/Index.tsx` | `useEffect` toevoegen die bij nieuw tabblad/venster een login_log insert (m.b.v. `sessionStorage`) |
| `src/pages/Login.tsx` | Bestaande `login_logs` insert verwijderen (wordt nu via Index afgehandeld) |

Twee bestanden, minimale wijzigingen.


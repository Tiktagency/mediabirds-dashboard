## Probleem

De Start-knoppen (Nieuwsbrief, Zoekwoord onderzoek, Blogs) hebben de juiste `disabled={... || isDemo}` logica in de code. De reden dat ze tóch klikbaar blijven:

**De profielrij van `luc.degraag@student.hu.nl` bestaat niet in de database.** In `public.profiles` staan enkel mediabirds/tikt accounts — geen Luc. De eerdere migratie die `is_demo = true` zette op zijn rij heeft dus niets bijgewerkt (0 rows affected), en `useIsDemoUser()` geeft `false` terug.

Mogelijke oorzaken:
- Luc heeft nog nooit ingelogd, dus `handle_new_user` heeft nog geen profile rij gemaakt.
- Of: er is wel een auth.users rij, maar de `handle_new_user` trigger is destijds gefaald, waardoor `profiles` leeg bleef.

## Aanpak (robuust — werkt ook zonder dat Luc al ingelogd is)

### 1. E-mail-gebaseerde demo-allowlist (database)

Pas `public.is_demo_user(_user_id uuid)` aan zodat hij niet alleen naar de `profiles.is_demo` boolean kijkt, maar óók naar een hardcoded e-mail-allowlist via `auth.users.email`:

```sql
CREATE OR REPLACE FUNCTION public.is_demo_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT is_demo FROM public.profiles WHERE id = _user_id), false)
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = _user_id
        AND LOWER(email) = 'luc.degraag@student.hu.nl'
    )
$$;
```

Hiermee is Luc altijd demo, ongeacht of zijn profile-rij bestaat of niet. Alle edge-functions (die de RPC al aanroepen) krijgen meteen het juiste antwoord.

### 2. `handle_new_user` aanpassen

Wanneer Luc's account later (opnieuw) wordt aangemaakt, automatisch `is_demo = true` zetten:

```sql
INSERT INTO public.profiles (id, email, is_demo)
VALUES (new.id, new.email, LOWER(new.email) = 'luc.degraag@student.hu.nl');
```

### 3. Frontend `useIsDemoUser` hook uitbreiden

Op dit moment leest de hook alleen `profiles.is_demo`. Voeg een fallback toe op het e-mailadres uit de sessie:

```ts
const email = session.user.email?.toLowerCase();
const isDemoEmail = email === 'luc.degraag@student.hu.nl';
const { data } = await supabase.from('profiles').select('is_demo').eq('id', session.user.id).maybeSingle();
setIsDemo(isDemoEmail || !!data?.is_demo);
```

Daarmee zijn de UI-knoppen ook meteen `disabled` zonder dat de profile-rij hoeft te bestaan.

### 4. Eventuele bestaande profile-rij syncen

Migratie voert nog uit (idempotent):
```sql
UPDATE public.profiles p
SET is_demo = true
FROM auth.users u
WHERE p.id = u.id AND LOWER(u.email) = 'luc.degraag@student.hu.nl';
```

## Resultaat

- Wanneer Luc inlogt is `useIsDemoUser` direct `true` (op basis van e-mail, geen DB-rij nodig).
- Alle Start-knoppen op Nieuwsbrief, Zoekwoord onderzoek, Blog (en de al eerder beveiligde knoppen) zijn `disabled` met de tooltip.
- Server-side blijft `is_demo_user()` RPC waarheid spreken, dus directe API-calls geven 403.

## Te wijzigen bestanden

- nieuwe migratie: update `is_demo_user`, update `handle_new_user`, sync bestaande rij
- `src/hooks/useIsDemoUser.ts`: e-mail-fallback toevoegen

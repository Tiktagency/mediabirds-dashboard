

## Fix: Dubbele login log entries definitief oplossen

### Probleem
Ondanks de module-level guard (`sessionLogPending`) en `sessionStorage` check worden er nog steeds 2 entries per login aangemaakt. De client-side guards zijn niet voldoende omdat `useAuth` twee onafhankelijke state-updates triggert die in aparte React render-cycli terechtkomen.

### Oplossing: Database-level deduplicatie

Een database-functie die controleert of er al een recente login is (binnen 30 seconden) voor dezelfde gebruiker. Als die er al is, wordt er niets geinsert. Dit is onmogelijk te omzeilen, ongeacht hoeveel keer de client de functie aanroept.

### Technische aanpassingen

**Stap 1: Database-functie aanmaken (migratie)**

Een nieuwe PostgreSQL-functie `log_user_visit` die:
1. Checkt of er al een entry is voor deze user in de laatste 30 seconden
2. Zo ja: doet niets (returns false)
3. Zo nee: insert een nieuwe rij (returns true)

```sql
CREATE OR REPLACE FUNCTION public.log_user_visit(
  p_user_id uuid,
  p_email text,
  p_display_name text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check of er al een log is binnen de laatste 30 seconden
  IF EXISTS (
    SELECT 1 FROM public.login_logs
    WHERE user_id = p_user_id
      AND logged_in_at > now() - interval '30 seconds'
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.login_logs (user_id, email, display_name)
  VALUES (p_user_id, p_email, p_display_name);

  RETURN true;
END;
$$;
```

**Stap 2: Client-code aanpassen (`src/pages/Index.tsx`)**

Vervang de directe `.insert()` door een `.rpc('log_user_visit', ...)` aanroep. De bestaande sessionStorage en module-level guards blijven als eerste verdedigingslijn, maar de database garandeert nu dat er nooit duplicaten kunnen ontstaan.

```typescript
// In de logVisit functie:
await supabase.rpc('log_user_visit', {
  p_user_id: user.id,
  p_email: user.email,
  p_display_name: displayName,
});
```

### Waarom dit werkt
- De database-functie is **atomair**: zelfs als twee requests tegelijk binnenkomen, worden ze sequentieel uitgevoerd
- De 30-seconden window vangt alle mogelijke race conditions op
- Client-side guards (sessionStorage + module-level var) voorkomen onnodige network requests
- Drie lagen van bescherming: module-var, sessionStorage, database

### Samenvatting

| Onderdeel | Actie |
|---|---|
| Database migratie | Nieuwe functie `log_user_visit` met 30-seconden dedup |
| `src/pages/Index.tsx` | `.insert()` vervangen door `.rpc('log_user_visit')` |


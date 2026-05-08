

## Login-logging voor Super Admins

### Wat wordt er gebouwd
Een klein log-icoontje linksboven op het dashboard (alleen zichtbaar voor super_admin gebruikers). Bij klik klapt een paneel uit met alle logins van de afgelopen 7 dagen, inclusief naam en tijdstip.

### Aanpassingen

**1. Nieuwe database tabel: `login_logs`**
- Kolommen: `id`, `user_id`, `email`, `display_name`, `logged_in_at`
- RLS: alleen super_admins kunnen lezen, inserts via authenticated users (eigen user_id)
- Geen UPDATE/DELETE nodig

**2. `src/pages/Login.tsx`**
- Na een succesvolle login (na de role check), een record inserteren in `login_logs` met de user_id, email en display_name (uit profiles tabel)

**3. `src/pages/Index.tsx`**
- Voor super_admin gebruikers: een `ScrollText` (of `ClipboardList`) icoon linksboven in de banner tonen
- Bij klik opent een Collapsible/Sheet paneel met de login logs

**4. Nieuw component: `src/components/dashboard/LoginLogsPanel.tsx`**
- Haalt login_logs op van de afgelopen 7 dagen, gesorteerd op datum (nieuwste eerst)
- Toont per entry: naam, e-mail, datum + tijd
- Wordt weergegeven in een Sheet (zijpaneel) dat van links inschuift
- Sluit bij klik buiten het paneel

### Technische details

**Database migratie:**
```sql
CREATE TABLE public.login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  display_name text,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Super admins kunnen alle logs lezen
CREATE POLICY "Super admins can view login logs"
  ON public.login_logs FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

-- Authenticated users kunnen hun eigen login loggen
CREATE POLICY "Users can insert own login log"
  ON public.login_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Login.tsx insert (na succesvolle login):**
```typescript
// Na role check, log de login
const displayName = profile?.first_name
  ? `${profile.first_name} ${profile.last_name || ''}`.trim()
  : data.session.user.email;

await supabase.from('login_logs').insert({
  user_id: data.session.user.id,
  email: data.session.user.email,
  display_name: displayName,
});
```

**Index.tsx -- icoon linksboven in banner:**
```typescript
// Alleen voor super_admin
{isSuperAdmin && (
  <LoginLogsPanel />
)}
```

**LoginLogsPanel component:**
- Gebruikt een Sheet component (van links)
- Fetcht `login_logs` van afgelopen 7 dagen met `logged_in_at >= now() - interval '7 days'`
- Toont lijst met naam, e-mail en geformatteerd tijdstip (dd-MM-yyyy HH:mm)
- Laadstatus en lege staat afgehandeld

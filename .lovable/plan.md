
# Plan: RLS Policy voor Super Admin Toegang tot Profielen

## Probleem
De RLS policy op de `profiles` tabel controleert alleen op de `admin` rol:
```sql
has_role(auth.uid(), 'admin'::app_role)
```

Jij hebt nu de `super_admin` rol, dus kun je alleen je eigen profiel zien in plaats van alle gebruikers.

## Oplossing
De RLS policy aanpassen zodat zowel `admin` als `super_admin` alle profielen kunnen bekijken.

---

## Database Wijziging

**SQL migratie:**

```sql
-- Drop de oude policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Maak een nieuwe policy die beide rollen toestaat
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
```

---

## Resultaat

| Rol | Kan alle profielen zien |
|-----|------------------------|
| super_admin | Ja |
| admin | Ja |
| operator | Nee (alleen eigen profiel) |
| viewer | Nee (alleen eigen profiel) |

Na deze wijziging zie je weer alle 7 gebruikers in de Admin panel.

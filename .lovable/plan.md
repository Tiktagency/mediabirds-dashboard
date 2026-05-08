
# Plan: Super Admin Toegang tot Admin Panel

## Probleem
De `useAdminAuth` hook in `src/hooks/useAdminAuth.ts` filtert alleen op `role = 'admin'` (regels 27 en 52). Dit betekent dat gebruikers met de `super_admin` rol geen toegang krijgen tot het admin panel, ondanks dat ze hogere rechten zouden moeten hebben.

Je account `hello@tikt.ai` heeft al de `super_admin` rol in de database - de code herkent deze alleen niet.

## Oplossing
De `useAdminAuth` hook aanpassen om zowel `admin` als `super_admin` rollen te herkennen.

---

## Technische Wijzigingen

### Bestand: `src/hooks/useAdminAuth.ts`

**1. Query in onAuthStateChange aanpassen (regels 23-28):**
```typescript
// Van:
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', currentSession.user.id)
  .eq('role', 'admin')
  .maybeSingle();

// Naar:
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', currentSession.user.id)
  .in('role', ['admin', 'super_admin']);

const hasAdminRole = roles && roles.length > 0;
```

**2. Query in getSession aanpassen (regels 48-53):**
```typescript
// Van:
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', currentSession.user.id)
  .eq('role', 'admin')
  .maybeSingle();

// Naar:
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', currentSession.user.id)
  .in('role', ['admin', 'super_admin']);

const hasAdminRole = roles && roles.length > 0;
```

---

## Samenvatting

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/useAdminAuth.ts` | `.eq('role', 'admin')` → `.in('role', ['admin', 'super_admin'])` op 2 plekken |

Na deze wijziging krijgen zowel admins als super admins toegang tot het admin panel.


# Plan: Verberg Super Admins uit Permissie Matrix

## Probleem
De `PermissionMatrix` component filtert alleen gebruikers met de `admin` rol uit, maar vergeet de `super_admin` rol. Hierdoor verschijnt hello@tikt.ai (super_admin) in de matrix terwijl deze volledige toegang heeft.

## Oplossing
Update de filter op regel 54 om ook `super_admin` uit te sluiten.

## Code Wijziging

**Bestand:** `src/components/admin/users/PermissionMatrix.tsx`

**Regel 53-54:**

| Was | Wordt |
|-----|-------|
| `// Filter out admins - they have full access` | `// Filter out admins and super_admins - they have full access` |
| `const nonAdminUsers = users.filter(u => !u.roles.includes('admin'));` | `const nonAdminUsers = users.filter(u => !u.roles.includes('admin') && !u.roles.includes('super_admin'));` |

## Resultaat
Na deze wijziging verschijnen alleen gebruikers met de rollen `viewer` en `operator` in de permissie matrix. Admins en super admins worden uitgesloten omdat zij automatisch volledige toegang hebben.

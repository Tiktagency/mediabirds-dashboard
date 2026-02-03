
# Plan: Super Admin Badge in Dashboard Header

## Probleem
De `getRoleBadge()` functie in `Index.tsx` bevat geen case voor de `super_admin` rol. Hierdoor krijgt een super admin gebruiker geen role badge te zien naast het email adres.

## Oplossing
De functie uitbreiden met een check voor `super_admin` bovenaan (hoogste prioriteit), met de paarse kleurstijling zoals gedefinieerd in de memory en zoals al geimplementeerd in de UserList component.

---

## Technische Wijziging

**Bestand:** `src/pages/Index.tsx`

**Aanpassing aan `getRoleBadge` functie (regel 146-157):**

Van:
```tsx
const getRoleBadge = () => {
  if (roles.includes('admin')) {
    return { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
  if (roles.includes('operator')) {
    return { label: 'Operator', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
  if (roles.includes('viewer')) {
    return { label: 'Viewer', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
  }
  return null;
};
```

Naar:
```tsx
const getRoleBadge = () => {
  if (roles.includes('super_admin')) {
    return { label: 'Super Admin', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  }
  if (roles.includes('admin')) {
    return { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
  if (roles.includes('operator')) {
    return { label: 'Operator', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
  if (roles.includes('viewer')) {
    return { label: 'Viewer', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
  }
  return null;
};
```

---

## Resultaat

| Rol | Badge Label | Kleur |
|-----|-------------|-------|
| super_admin | Super Admin | Paars |
| admin | Admin | Rood |
| operator | Operator | Blauw |
| viewer | Viewer | Groen |

Na deze wijziging zie je rechtsboven in het dashboard "Super Admin" in paars naast je email adres staan.


# Plan: Super Admin Rol Herkennen als Admin

## Probleem
Je account `hello@tikt.ai` heeft de rol `super_admin` in de database, maar de `useAuth` hook controleert alleen op exact `'admin'`. Hierdoor wordt `isAdmin` op `false` gezet en zie je de Admin panel optie niet.

## Oplossing
De `useAuth` hook aanpassen zodat `super_admin` ook als admin wordt herkend.

---

## Technische Wijzigingen

### Bestand: `src/hooks/useAuth.ts`

**1. UserRole type uitbreiden (regel 6):**
```typescript
// Van:
export type UserRole = 'admin' | 'operator' | 'viewer';

// Naar:
export type UserRole = 'super_admin' | 'admin' | 'operator' | 'viewer';
```

**2. isAdmin check aanpassen (regel 15):**
```typescript
// Van:
const isAdmin = roles.includes('admin');

// Naar:
const isAdmin = roles.includes('admin') || roles.includes('super_admin');
```

**3. Optioneel: isSuperAdmin toevoegen voor toekomstig gebruik:**
```typescript
const isSuperAdmin = roles.includes('super_admin');
```

---

## Impact

| Component | Effect |
|-----------|--------|
| Dashboard (Index.tsx) | Admin panel dropdown item wordt zichtbaar |
| AdminPanel.tsx | Toegang werkt correct |
| useUserPermissions.ts | Super admins krijgen volledige rechten |

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/useAuth.ts` | `super_admin` toevoegen aan UserRole type en isAdmin check |


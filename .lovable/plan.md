
# Plan: Super Admin Rol Toevoegen

## Overzicht
Een nieuwe "Super Admin" rol toevoegen aan het bestaande role-based access control systeem. Super Admin is het hoogste niveau met volledige toegang inclusief het beheren van andere admins.

---

## Rol Hiërarchie (na implementatie)

| Rol | Kleur | Rechten |
|-----|-------|---------|
| **Super Admin** | Paars | Alles + beheren van admins |
| Admin | Rood | Volledige toegang behalve super admin functies |
| Operator | Blauw | Bekijken + uitvoeren |
| Viewer | Groen | Alleen bekijken |

---

## 1. Database Migratie

**Actie:** `app_role` enum uitbreiden met `'super_admin'`

```sql
ALTER TYPE public.app_role ADD VALUE 'super_admin';
```

---

## 2. Edge Functions Aanpassen

### `supabase/functions/manage-user-roles/index.ts`
- `validateRole()` functie: `['super_admin', 'admin', 'operator', 'viewer']`
- Admin check aanpassen: zowel `admin` als `super_admin` mogen rollen beheren

### `supabase/functions/invite-user/index.ts`
- `validateRole()` functie uitbreiden
- Admin check aanpassen voor super_admin

---

## 3. Frontend Types Aanpassen

### `src/hooks/useUserManagement.ts`
```typescript
export type AppRole = 'super_admin' | 'admin' | 'operator' | 'viewer';
```

### `src/hooks/useAuth.ts`
```typescript
export type UserRole = 'super_admin' | 'admin' | 'operator' | 'viewer';
// + isSuperAdmin boolean toevoegen
```

### `src/hooks/useUserPermissions.ts`
```typescript
// + isSuperAdmin flag toevoegen
const isSuperAdmin = userRoles.includes('super_admin');
```

---

## 4. UI Componenten Aanpassen

### `src/components/admin/users/UserList.tsx`

**roleConfig uitbreiden:**
```typescript
super_admin: { 
  label: 'Super Admin', 
  icon: <Crown className="w-3 h-3" />, 
  color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
}
```

**Select opties toevoegen:**
```tsx
<SelectItem value="super_admin">
  <span className="flex items-center gap-2">
    <Crown className="w-3 h-3" /> Super Admin
  </span>
</SelectItem>
```

### `src/components/admin/users/UsersTab.tsx`

**Stats grid uitbreiden naar 5 kolommen:**
- Super Admin counter met paarse kleur

### `src/components/admin/users/InviteUserModal.tsx`

**Super Admin optie toevoegen:**
```tsx
<SelectItem value="super_admin">Super Admin - Hoogste toegang</SelectItem>
```

### `src/components/admin/users/PermissionMatrix.tsx`

**Badge toevoegen:**
```tsx
<Badge className="bg-purple-500/10 border-purple-500/30 text-purple-400">
  Super Admin = Volledige toegang + admin beheer
</Badge>
```

**Filter aanpassen:**
```typescript
const nonAdminUsers = users.filter(u => 
  !u.roles.includes('admin') && !u.roles.includes('super_admin')
);
```

---

## 5. Admin Panel Toegang

### `src/hooks/useAdminAuth.ts`
Admin panel toegang voor beide:
```typescript
const isAdminUser = roles.includes('admin') || roles.includes('super_admin');
```

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| Database migratie | `app_role` enum uitbreiden |
| `supabase/functions/manage-user-roles/index.ts` | validateRole + admin check |
| `supabase/functions/invite-user/index.ts` | validateRole + admin check |
| `src/hooks/useUserManagement.ts` | AppRole type |
| `src/hooks/useAuth.ts` | UserRole type + isSuperAdmin |
| `src/hooks/useUserPermissions.ts` | isSuperAdmin flag |
| `src/hooks/useAdminAuth.ts` | Admin check uitbreiden |
| `src/components/admin/users/UserList.tsx` | roleConfig + Select |
| `src/components/admin/users/UsersTab.tsx` | Stats grid |
| `src/components/admin/users/InviteUserModal.tsx` | Select opties |
| `src/components/admin/users/PermissionMatrix.tsx` | Badges + filter |

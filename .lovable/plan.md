
# Plan: Voorkom Zelf-Downgrade van Rollen

## Probleem
Gebruikers kunnen momenteel hun eigen rol naar een lagere waarde wijzigen. Dit moet worden geblokkeerd.

## Rol Hiërarchie
| Rang | Rol | Niveau |
|------|-----|--------|
| 1 | super_admin | 4 (hoogst) |
| 2 | admin | 3 |
| 3 | operator | 2 |
| 4 | viewer | 1 (laagst) |

## Oplossing
Twee lagen van bescherming implementeren:

### 1. Backend Edge Function (primaire beveiliging)

**Bestand:** `supabase/functions/manage-user-roles/index.ts`

**Wijzigingen:**

1. **validateRole uitbreiden met super_admin** (regel 32-41):
```typescript
function validateRole(role: unknown): 'super_admin' | 'admin' | 'operator' | 'viewer' {
  const validRoles = ['super_admin', 'admin', 'operator', 'viewer'];
  // ...
}
```

2. **Rol hiërarchie helper toevoegen** (nieuwe functie):
```typescript
const roleHierarchy: Record<string, number> = {
  'super_admin': 4,
  'admin': 3,
  'operator': 2,
  'viewer': 1,
};

function getRoleLevel(role: string): number {
  return roleHierarchy[role] || 0;
}
```

3. **Self-downgrade check toevoegen** in `assign-role` case (rond regel 97-119):
```typescript
case 'assign-role': {
  const role = validateRole(body.role);
  
  // Check: voorkom zelf-downgrade
  if (userId === user.id) {
    // Haal huidige rol van gebruiker op
    const { data: currentRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    const currentLevel = Math.max(
      ...((currentRoles || []).map(r => getRoleLevel(r.role))),
      0
    );
    const newLevel = getRoleLevel(role);
    
    if (newLevel < currentLevel) {
      return new Response(JSON.stringify({ 
        error: 'Je kunt je eigen rol niet naar een lager niveau wijzigen' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
  
  // ... rest van de code
}
```

### 2. Frontend UI (gebruikerservaring)

**Bestand:** `src/components/admin/users/UserList.tsx`

**Wijzigingen:**

1. **Props uitbreiden** om huidige gebruiker ID door te geven:
```typescript
interface UserListProps {
  users: UserProfile[];
  currentUserId?: string;  // Toevoegen
  onUpdateRole: (userId: string, role: AppRole) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}
```

2. **Rol opties filteren** voor de huidige gebruiker (in de Select component):
- Als de gebruiker zichzelf bewerkt, toon alleen rollen die gelijk of hoger zijn dan hun huidige rol
- Disable de Select volledig als er geen hogere rollen beschikbaar zijn

**Bestand:** `src/components/admin/users/UsersTab.tsx`

**Wijziging:**
- Haal `user` uit `useAuth()` hook
- Geef `currentUserId={user?.id}` door aan `UserList`

## Samenvatting Wijzigingen

| Bestand | Wijziging |
|---------|-----------|
| `supabase/functions/manage-user-roles/index.ts` | Backend validatie + super_admin in validateRole |
| `src/components/admin/users/UserList.tsx` | Filter opties voor eigen rol |
| `src/components/admin/users/UsersTab.tsx` | currentUserId prop doorgeven |

## Gedrag na Implementatie

| Scenario | Resultaat |
|----------|-----------|
| Admin wijzigt eigen rol naar viewer | **GEBLOKKEERD** |
| Super admin wijzigt eigen rol naar admin | **GEBLOKKEERD** |
| Admin wijzigt andere gebruiker naar viewer | Toegestaan |
| Super admin wijzigt andere admin naar viewer | Toegestaan |
| Admin wijzigt eigen rol naar super_admin | Toegestaan (upgrade) |

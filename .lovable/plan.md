
# Plan: Super Admin Check in Invite-User Edge Function

## Probleem
De `invite-user` edge function controleert op regel 86 alleen op de `admin` rol. Dit betekent dat `super_admin` gebruikers geen nieuwe gebruikers kunnen uitnodigen.

## Oplossing
Update de admin check in de `invite-user` edge function om ook `super_admin` te accepteren.

## Code Wijziging

**Bestand:** `supabase/functions/invite-user/index.ts`

**Huidige code (regels 81-87):**
```typescript
// Check if user is admin
const { data: adminCheck } = await supabaseAdmin
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'admin')
  .single();
```

**Nieuwe code:**
```typescript
// Check if user is admin or super_admin
const { data: adminCheck } = await supabaseAdmin
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .in('role', ['admin', 'super_admin']);
```

## Wijzigingen

| Locatie | Was | Wordt |
|---------|-----|-------|
| Regel 81 | `// Check if user is admin` | `// Check if user is admin or super_admin` |
| Regel 86 | `.eq('role', 'admin')` | `.in('role', ['admin', 'super_admin'])` |
| Regel 87 | `.single();` | (verwijderd - niet nodig bij `.in()`) |

## Aanvullende check (regel 89)
De huidige check `if (!adminCheck)` werkt nog steeds correct omdat `.in()` een array teruggeeft die `truthy` is als er resultaten zijn.

Update naar:
```typescript
if (!adminCheck || adminCheck.length === 0) {
```

## Overzicht na implementatie

| Component | Status |
|-----------|--------|
| useAuth hook | OK - beide rollen |
| useAdminAuth hook | OK - beide rollen |
| AdminPanel pagina | OK - gebruikt useAdminAuth |
| CompanySelector | OK - net bijgewerkt |
| manage-user-roles edge function | OK - beide rollen |
| invite-user edge function | Wordt bijgewerkt |

Na deze wijziging kunnen `super_admin` gebruikers alle functies uitvoeren die `admin` gebruikers kunnen doen.

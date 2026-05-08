
# Plan: Super Admin Check in CompanySelector

## Probleem
De "Bedrijf toevoegen" optie en delete-iconen zijn onzichtbaar voor `super_admin` gebruikers omdat de admin-check alleen op de `admin` rol filtert.

## Oplossing
Update de `checkAdminStatus` functie om ook `super_admin` te herkennen met een `in` filter.

## Code Wijziging

**Bestand:** `src/components/seo/CompanySelector.tsx`

**Huidige code (regels 59-74):**
```javascript
useEffect(() => {
  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      setIsAdmin(!!data);
    }
  };

  checkAdminStatus();
}, []);
```

**Nieuwe code:**
```javascript
useEffect(() => {
  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  checkAdminStatus();
}, []);
```

## Wijzigingen
| Regel | Was | Wordt |
|-------|-----|-------|
| 67 | `.eq('role', 'admin')` | `.in('role', ['admin', 'super_admin'])` |
| 68 | `.single()` | `.maybeSingle()` |

## Resultaat
Na deze wijziging zien zowel `admin` als `super_admin` gebruikers:
- De "Bedrijf toevoegen" optie in de dropdown
- Het verwijder-icoon bij elk bedrijf

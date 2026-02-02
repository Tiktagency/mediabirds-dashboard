
# Plan: Knopkleur Toepassen op "Uitnodigen" Knop

## Wijziging

**Bestand:** `src/components/admin/users/InviteUserModal.tsx`

**Regel 104** - "Uitnodigen" knop aanpassen:

```tsx
// Van:
<Button onClick={handleInvite} disabled={isLoading}>

// Naar:
<Button onClick={handleInvite} disabled={isLoading} variant="primaryCustom">
```

Dit zorgt ervoor dat de "Uitnodigen" knop in de gebruikersuitnodiging modal dezelfde custom kleuren gebruikt als alle andere primaire knoppen in de applicatie.

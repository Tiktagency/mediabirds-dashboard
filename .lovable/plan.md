

# Alleen super_admin mag bedrijven verwijderen

## Wat verandert er

Op de SEO-pagina kan momenteel elke admin of super_admin een bedrijf verwijderen via het prullenbak-icoon in de bedrijfsselector. Dit wordt beperkt zodat alleen gebruikers met de rol `super_admin` het verwijder-icoon zien en kunnen gebruiken.

## Technisch

**Bestand: `src/components/seo/CompanySelector.tsx`**

1. Een extra state `isSuperAdmin` toevoegen (naast de bestaande `isAdmin`)
2. In de `checkAdminStatus` functie apart controleren op de `super_admin` rol
3. Het prullenbak-icoon (Trash2) alleen tonen wanneer `isSuperAdmin` true is (in plaats van `isAdmin`)
4. De "Bedrijf toevoegen" optie blijft beschikbaar voor zowel admin als super_admin (ongewijzigd)

De RLS policy op de `companies` tabel staat al DELETE toe voor zowel admin als super_admin. De beperking wordt puur in de frontend afgedwongen door het verwijder-icoon te verbergen voor niet-super_admins.




## Nieuw "Rollen" tabblad in het Admin Panel

### Wat verandert er
Er komt een vijfde tabblad "Rollen" naast "Gebruikers" in het Admin Panel. Dit tabblad toont een overzicht van alle rollen (Viewer, Operator, Admin, Super Admin) met per rol de standaard machtigingen per automation. Je kunt de standaardmachtigingen per rol aanpassen via checkboxes en er is een reset-knop om terug te gaan naar de standaardinstellingen.

### Hoe het werkt
- Een matrix-tabel met rollen als rijen en automations als kolommen
- Per cel drie checkboxes: Bekijken (V), Uitvoeren (U), Beheren (B)
- Admin en Super Admin rijen zijn uitgeschakeld (altijd volledige toegang)
- Een "Reset naar standaard" knop die de standaardwaarden herstelt:
  - Viewer: alleen Bekijken aan
  - Operator: Bekijken + Uitvoeren aan
- De standaarden worden opgeslagen in een nieuwe database-tabel `role_default_permissions`

### Database
Nieuwe tabel `role_default_permissions` met kolommen:
- `id` (uuid, primary key)
- `role` (app_role)
- `automation_name` (text)
- `can_view` (boolean, default true)
- `can_execute` (boolean, default false)
- `can_manage` (boolean, default false)
- `created_at` / `updated_at` (timestamps)
- Unieke constraint op (role, automation_name)
- RLS: admins en super_admins kunnen alles, andere rollen kunnen lezen

### Technische wijzigingen

1. **Database migratie**: Nieuwe tabel `role_default_permissions` aanmaken met RLS policies

2. **Nieuw bestand: `src/hooks/useRoleDefaults.ts`**
   - Hook voor het ophalen, bijwerken en resetten van standaard rolpermissies
   - Reset-functie herstelt Viewer = can_view only, Operator = can_view + can_execute

3. **Nieuw bestand: `src/components/admin/roles/RolesTab.tsx`**
   - Toont matrix met rollen (Viewer, Operator) als rijen en automations als kolommen
   - Checkboxes voor V/U/B per combinatie
   - Admin/Super Admin rij met uitgeschakelde checkboxes (altijd volledig)
   - Reset-knop onderaan

4. **Bestand: `src/components/admin/AdminTabs.tsx`**
   - Grid wijzigen van 4 naar 5 kolommen
   - Nieuw "Rollen" tabblad toevoegen met Shield-icoon, geplaatst na "Gebruikers"


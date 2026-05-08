

## Rollen-tabblad herindelen: rollen horizontaal, machtigingen verticaal + systeemmachtigingen

### Wat verandert er
Het Rollen-tabblad wordt volledig herindeld:
- **Rollen staan horizontaal** (kolommen): Viewer, Operator, Admin, Super Admin
- **Machtigingen staan verticaal** (rijen), opgedeeld in twee secties:
  1. **Systeemmachtigingen** -- nieuwe rijen die laten zien wat elke rol kan op systeemniveau
  2. **Automatiemachtigingen** -- per automation de V/U/B checkboxes

### Systeemmachtigingen (alleen-lezen overzicht)
Deze worden niet opgeslagen in de database maar zijn statisch weergegeven als referentie:

| Machtiging                     | Viewer | Operator | Admin | Super Admin |
|---                             |---     |---       |---    |---          |
| Dashboard bekijken             | Ja     | Ja       | Ja    | Ja          |
| Automations uitvoeren          | Nee    | Ja       | Ja    | Ja          |
| Admin Panel openen             | Nee    | Nee      | Ja    | Ja          |
| Gebruikers uitnodigen          | Nee    | Nee      | Ja    | Ja          |
| Rollen toewijzen/degraderen    | Nee    | Nee      | Ja    | Ja          |
| Automation-instellingen beheren| Nee    | Nee      | Ja    | Ja          |
| Andere admins beheren          | Nee    | Nee      | Nee   | Ja          |

### Automatiemachtigingen (bewerkbaar)
Per automation een rij met drie sub-rijen (Bekijken / Uitvoeren / Beheren). De kolommen Viewer en Operator zijn bewerkbaar via checkboxes, Admin en Super Admin zijn vergrendeld (altijd aan).

### Layout
```text
+-----------------------------------+--------+----------+-------+-------------+
| Machtiging                        | Viewer | Operator | Admin | Super Admin |
+===================================+========+==========+=======+=============+
| SYSTEEMMACHTIGINGEN               |        |          |       |             |
+-----------------------------------+--------+----------+-------+-------------+
| Dashboard bekijken                |   V    |    V     |   V   |      V      |
| Automations uitvoeren             |   X    |    V     |   V   |      V      |
| Admin Panel openen                |   X    |    X     |   V   |      V      |
| Gebruikers uitnodigen             |   X    |    X     |   V   |      V      |
| Rollen toewijzen/degraderen       |   X    |    X     |   V   |      V      |
| Automation-instellingen beheren   |   X    |    X     |   V   |      V      |
| Andere admins beheren             |   X    |    X     |   X   |      V      |
+-----------------------------------+--------+----------+-------+-------------+
| AUTOMATIEMACHTIGINGEN             |        |          |       |             |
+-----------------------------------+--------+----------+-------+-------------+
| SEO Blog - Bekijken              |  [v]   |   [v]    |   V   |      V      |
| SEO Blog - Uitvoeren             |  [ ]   |   [v]    |   V   |      V      |
| SEO Blog - Beheren               |  [ ]   |   [ ]    |   V   |      V      |
| Chatbot - Bekijken               |  [v]   |   [v]    |   V   |      V      |
| ...                               |        |          |       |             |
+-----------------------------------+--------+----------+-------+-------------+
```

### Technische wijzigingen

**1. Bestand: `src/components/admin/roles/RolesTab.tsx`** -- volledig herschrijven
- Nieuwe tabelstructuur: rollen als kolommen, machtigingen als rijen
- Sectie "Systeemmachtigingen" bovenaan met statische check/cross iconen (niet bewerkbaar, puur informatief)
- Sectie "Automatiemachtigingen" daaronder: per automation 3 rijen (Bekijken, Uitvoeren, Beheren) met checkboxes voor Viewer/Operator en vergrendelde vinkjes voor Admin/Super Admin
- De systeemmachtigingen worden gedefinieerd als een constante array in de component, geen database nodig
- Reset-knop blijft behouden

**2. Bestand: `src/hooks/useRoleDefaults.ts`** -- geen wijzigingen nodig
De hook blijft ongewijzigd; alleen de UI-laag verandert.


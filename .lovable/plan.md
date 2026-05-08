

## "Overzicht" knop toevoegen naast bedrijven dropdown

### Wat wordt er gebouwd

Een "Overzicht" knop links naast de bedrijven-dropdown op de SEO-pagina. Wanneer je hierop klikt, opent een overzichtelijk dialoogvenster met een tabel van alle bedrijven en hun toegewezen beheerder.

### Visueel ontwerp

```text
[ Overzicht ]  [ Building2  Bedrijfsnaam  v ]  [ Handleiding ]  [ Notificaties ]
```

Het overzicht toont een schone tabel:

```text
+---------------------------------------------+
|  Bedrijfsoverzicht                      [X] |
|---------------------------------------------|
|  Bedrijf           | Beheerd door           |
|---------------------|------------------------|
|  Mediabirds         | lotte@mediabirds.nl    |
|  Klant B            | joost@mediabirds.nl    |
|  Klant C            | -                      |
+---------------------------------------------+
```

### Technische wijzigingen

**1. Nieuw bestand: `src/components/seo/CompanyOverviewDialog.tsx`**

- Een Dialog component dat alle bedrijven ophaalt uit de `companies` tabel (inclusief `managed_by`)
- Per bedrijf de bijbehorende beheerder opzoekt uit de `profiles` tabel
- Toont een gestileerde tabel met twee kolommen: Bedrijf en Beheerd door
- Bedrijven zonder beheerder tonen een streepje of "Niet ingesteld"
- Gebruikt bestaande UI-componenten: Dialog, Table, ScrollArea

**2. Bestand: `src/pages/SeoBlog.tsx`**

- Import van `CompanyOverviewDialog`
- State toevoegen: `isOverviewOpen`
- Een "Overzicht" knop toevoegen links naast de `CompanySelector` in de navigatiebalk
- Het dialoogvenster renderen met open/close state

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/seo/CompanyOverviewDialog.tsx` | Nieuw - overzichtsdialoog met tabel |
| `src/pages/SeoBlog.tsx` | Knop + state toevoegen in navigatiebalk |


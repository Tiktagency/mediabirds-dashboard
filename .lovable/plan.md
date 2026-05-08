

## WordPress Alt-Tekst pagina: afbeelding verwijderen en bedrijfsselector toevoegen

### Wat er verandert
1. De workflow-afbeelding wordt verwijderd van de pagina
2. Er komt een bedrijfsselector dropdown (vergelijkbaar met de SEO-pagina) maar met een **aparte** database-tabel
3. De hardcoded bedrijvenlijst wordt dynamisch op basis van de geselecteerde bedrijven in de nieuwe tabel
4. Admins kunnen bedrijven toevoegen (bedrijfsnaam + domeinnaam)
5. Super admins kunnen bedrijven verwijderen

### Database

**Nieuwe tabel: `alt_text_companies`**
- `id` (uuid, primary key)
- `name` (text, not null) - bedrijfsnaam
- `domain` (text) - domeinnaam
- `created_at` (timestamptz, default now())

RLS-policies:
- SELECT: admin + super_admin
- INSERT: admin + super_admin
- UPDATE: admin + super_admin
- DELETE: admin + super_admin

### Nieuwe component: `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`

Een vereenvoudigde versie van de bestaande `CompanySelector`, maar die leest/schrijft naar `alt_text_companies` in plaats van `companies`. Bevat:
- Dropdown met bedrijvenlijst
- "Bedrijf toevoegen" optie (voor admins) met dialog: bedrijfsnaam + domeinnaam
- Verwijder-icoon (alleen voor super_admins)
- Bevestigingsdialogen voor toevoegen en verwijderen

### Aanpassing: `src/pages/WordpressAltText.tsx`

- Import van `workflowImage` en de `<img>` tag verwijderen
- `AltTextCompanySelector` importeren en boven de Card plaatsen
- De hardcoded bedrijvenlijst in de Card vervangen door een dynamische lijst op basis van alle bedrijven uit `alt_text_companies`
- State toevoegen voor het geselecteerde bedrijf (puur voor de selector UI)

### Styling
- Dropdown gebruikt `bg-popover border-border` (huisstijl, geen blauwe tinten)
- Dezelfde look-and-feel als de bestaande CompanySelector op de SEO-pagina


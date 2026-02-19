

## Eigen bedrijvenlijst voor Landingspagina

### Wat verandert er

De Landingspagina krijgt een **eigen bedrijventabel** en een **eigen bedrijfsselector**, volledig losgekoppeld van de WordPress Alt-tekst pagina. Bij het toevoegen van een nieuw bedrijf wordt gekeken of dezelfde bedrijfsnaam al bestaat in `alt_text_companies` -- zo ja, worden de bekende velden (domeinnaam, applicatie wachtwoord) automatisch ingevuld.

### Stappen

**1. Nieuwe databasetabel: `landing_companies`**

Zelfde structuur als `alt_text_companies`, plus de twee extra velden voor Google Sheets:

| Kolom | Type | Omschrijving |
|---|---|---|
| id | uuid (PK) | Uniek ID |
| name | text (verplicht) | Bedrijfsnaam |
| domain | text | Domeinnaam |
| app_password | text | Applicatie wachtwoord |
| spreadsheet_id | text | Google Spreadsheet ID |
| grid_id | text | Google Grid ID |
| created_at | timestamptz | Aanmaakdatum |

RLS-policies worden identiek aan `alt_text_companies`: admins kunnen CRUD, super_admins kunnen verwijderen.

**2. Nieuw component: `LandingCompanySelector`**

Een kopie van `AltTextCompanySelector`, maar dan:
- Leest uit `landing_companies` in plaats van `alt_text_companies`
- Bij het toevoegen van een bedrijf: zoekt automatisch in `alt_text_companies` op basis van de bedrijfsnaam en vult domeinnaam + applicatie wachtwoord alvast in als die gevonden worden
- Slaat Spreadsheet ID en Grid ID ook op bij het bedrijf

**3. Landingspagina aanpassen**

- Importeert `LandingCompanySelector` in plaats van `AltTextCompanySelector`
- De velden Spreadsheet ID en Grid ID worden nu uit het geselecteerde bedrijf geladen (persistent opgeslagen)
- `handleFieldSave` slaat op naar `landing_companies` in plaats van `alt_text_companies`

### Technische details

**Database migratie (SQL):**
```sql
CREATE TABLE public.landing_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  app_password text,
  spreadsheet_id text,
  grid_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_companies ENABLE ROW LEVEL SECURITY;

-- Admins kunnen lezen, toevoegen, wijzigen
CREATE POLICY "Admins can view landing companies"
  ON public.landing_companies FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert landing companies"
  ON public.landing_companies FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update landing companies"
  ON public.landing_companies FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Alleen super_admins kunnen verwijderen
CREATE POLICY "Super admins can delete landing companies"
  ON public.landing_companies FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));
```

**Auto-invullen bij toevoegen (in LandingCompanySelector):**
```typescript
// Na het invullen van bedrijfsnaam, zoek in alt_text_companies
const { data: existing } = await supabase
  .from('alt_text_companies')
  .select('domain, app_password')
  .ilike('name', newCompanyName.trim())
  .maybeSingle();

if (existing) {
  setNewCompanyDomain(existing.domain || '');
  setNewCompanyPassword(existing.app_password || '');
}
```

### Bestanden

| Bestand | Actie |
|---|---|
| Database migratie | Nieuwe tabel `landing_companies` met RLS |
| `src/components/landing/LandingCompanySelector.tsx` | Nieuw component, eigen bedrijfsselector |
| `src/pages/Landingspagina.tsx` | Gebruik `LandingCompanySelector`, sla Spreadsheet/Grid ID op uit bedrijfsdata |




## Automatische trigger per bedrijf loskoppelen

### Huidige situatie

De `landing_schedules` tabel heeft geen `company_id` kolom -- er is maar 1 globale schedule voor alle bedrijven. De trigger staat nu ook boven de bedrijfsselectie.

### Wat verandert er

Elk bedrijf krijgt zijn eigen automatische trigger, net zoals bij SEO Blog en SEO Research.

---

### 1. Database: `company_id` kolom toevoegen aan `landing_schedules`

- Nieuwe kolom `company_id` (uuid, nullable zodat bestaande rij niet breekt)
- Foreign key naar `landing_companies.id`
- Unieke constraint op `company_id` (1 schedule per bedrijf)

### 2. Hook: `useLandingSchedule` aanpassen

- Accepteert `companyId` parameter (zoals `useBlogSchedule`)
- Fetcht schedule gefilterd op `company_id`
- Insert met `company_id` bij nieuw aanmaken
- Reset state als `companyId` verandert

### 3. Frontend: `Landingspagina.tsx` aanpassen

- `useLandingSchedule(selectedCompany?.id)` i.p.v. `useLandingSchedule()`
- ScheduleTrigger verplaatsen van boven de bedrijfsselectie naar binnen het bedrijfsblok (alleen zichtbaar als er een bedrijf geselecteerd is)
- `companyId` doorsturen als `selectedCompany?.id` i.p.v. hardcoded `"global"`

### 4. Edge function: `run-scheduled-landing` aanpassen

- Haalt alle enabled schedules op waar `next_trigger_at` verlopen is (meerdere bedrijven kunnen tegelijk due zijn)
- Per schedule: haalt het bijbehorende bedrijf op via `company_id` uit `landing_companies`
- Verwerkt elk bedrijf individueel en update per schedule de timestamps

### Technische details

| Onderdeel | Was | Wordt |
|---|---|---|
| `landing_schedules` | Geen `company_id` | `company_id` (uuid, FK naar `landing_companies`) |
| `useLandingSchedule()` | Geen parameter, haalt 1 globale rij | `useLandingSchedule(companyId)`, filtert op `company_id` |
| ScheduleTrigger positie | Boven bedrijfsselectie | Binnen bedrijfsblok |
| `run-scheduled-landing` | Haalt 1 schedule + alle bedrijven | Haalt alle due schedules, per schedule 1 bedrijf |


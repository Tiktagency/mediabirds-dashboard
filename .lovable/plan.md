

# "Beheerd door" Dropdown op SEO Pagina

## Wat wordt er gebouwd
Onder de subtitel "Beheer je zoekwoord onderzoek en blog generatie op een plek" komt een dropdown te staan met de tekst "Beheerd door: [naam]". In deze dropdown staan alle gebruikers met de rol **admin** of **operator**. De geselecteerde beheerder wordt per bedrijf opgeslagen.

## Wijzigingen

### 1. Database: Kolom toevoegen aan `companies` tabel
Een nieuwe kolom `managed_by` (uuid, nullable) wordt toegevoegd aan de `companies` tabel. Deze slaat de user ID op van de beheerder.

```sql
ALTER TABLE companies ADD COLUMN managed_by uuid;
```

### 2. Frontend: Dropdown component in SeoBlog.tsx
- Onder de subtitel op regel 207-209 komt een nieuwe sectie
- Bij het laden van de pagina worden alle gebruikers met rol `admin` of `operator` opgehaald via een query op `profiles` + `user_roles`
- De dropdown toont de email/naam van deze gebruikers
- Bij selectie wordt de `companies.managed_by` kolom bijgewerkt
- Alleen admins kunnen de beheerder wijzigen; andere gebruikers zien alleen de naam

### 3. Data ophalen
Query om admin/operator gebruikers op te halen:

```typescript
// Haal alle user_ids op met admin of operator rol
const { data: roleData } = await supabase
  .from('user_roles')
  .select('user_id, role')
  .in('role', ['admin', 'operator', 'super_admin']);

// Haal bijbehorende profielen op
const userIds = roleData.map(r => r.user_id);
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email')
  .in('id', userIds);
```

### 4. Visueel ontwerp
- Tekst "Beheerd door:" in `text-white/50` stijl, consistent met de subtitel
- Dropdown in dezelfde stijl als de CompanySelector (donker thema)
- Positie: direct onder de subtitel, voor de navigatie-tiles
- Alleen zichtbaar wanneer een bedrijf is geselecteerd

## Technische Details

**Bestanden die worden aangepast:**
- `src/pages/SeoBlog.tsx` - Dropdown toevoegen + state/logica voor managed_by
- Database migratie - `managed_by` kolom toevoegen

**Bestaande patronen die worden hergebruikt:**
- `Select` component uit `@/components/ui/select`
- Supabase client queries zoals in CompanySelector
- Styling consistent met de rest van de SEO pagina


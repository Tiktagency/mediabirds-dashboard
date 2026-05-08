

# Folder ID opslaan en meesturen bij verwijderen

## Wat verandert er

1. Een nieuwe kolom `folder_id` wordt toegevoegd aan de `companies` tabel om de bedrijfsmap-ID op te slaan
2. Bij het aanmaken van een bedrijf wordt de "Folder bedrijf" -> "Folder ID" uit de webhook-response opgeslagen in deze kolom
3. Bij het verwijderen van een bedrijf wordt de `folder_id` meegestuurd in de POST-request naar de webhook

## Aanpassingen

### 1. Database migratie

Nieuwe kolom toevoegen aan de `companies` tabel:

```sql
ALTER TABLE public.companies ADD COLUMN folder_id text;
```

### 2. Edge function: `trigger-add-company-webhook` aanpassen

Na het ontvangen van de webhook-response wordt naast de bestaande document-ID's ook de Folder ID opgeslagen:

```typescript
const folder = webhookData['Folder bedrijf'] || {};
```

En bij de company update:

```typescript
await supabase
  .from('companies')
  .update({ folder_id: toNull(folder['Folder ID']) })
  .eq('id', companyId);
```

### 3. CompanySelector.tsx aanpassen

De `Company` interface heeft al alle velden uit de tabel. Na de migratie wordt `folder_id` automatisch beschikbaar via het `*` select.

Bij het verwijderen wordt de `folder_id` meegestuurd:

```typescript
body: { bedrijfsnaam: companyToDelete.name, folderId: companyToDelete.folder_id }
```

### 4. Edge function: `trigger-delete-company-webhook` aanpassen

De function accepteert nu ook `folderId` en stuurt deze mee naar de webhook:

```typescript
const { bedrijfsnaam, folderId } = await req.json();
body: JSON.stringify({ bedrijfsnaam, folderId })
```

## Technische details

- De `Company` interface in CompanySelector.tsx moet uitgebreid worden met `folder_id: string | null`
- De `companies` tabel query gebruikt `select('*')`, dus de nieuwe kolom is automatisch beschikbaar na de migratie
- Als een bedrijf geen folder_id heeft (bijv. oudere bedrijven), wordt `null` meegestuurd -- de webhook kan hier mee omgaan

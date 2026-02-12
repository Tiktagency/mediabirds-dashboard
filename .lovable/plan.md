

# Fix: Google Document ID synchronisatie werkt niet

## Probleem

De `syncGoogleDocIds` functie gebruikt Supabase `upsert` met `onConflict: 'company_id'`, maar er bestaat geen UNIQUE constraint op de kolom `company_id` in `seo_settings` en `blog_settings`. Hierdoor mislukt de upsert zonder foutmelding en worden de velden niet gesynchroniseerd.

## Oplossing

### 1. Database migratie: UNIQUE constraints toevoegen

Voeg een UNIQUE constraint toe op `company_id` in beide tabellen:

```sql
ALTER TABLE seo_settings ADD CONSTRAINT seo_settings_company_id_unique UNIQUE (company_id);
ALTER TABLE blog_settings ADD CONSTRAINT blog_settings_company_id_unique UNIQUE (company_id);
```

### 2. Geen codewijzigingen nodig

De bestaande code in `useGoogleDocSync.ts` en de formulieren hoeft niet aangepast te worden. De upsert-aanroepen werken correct zodra de UNIQUE constraints bestaan.

## Technische details

- De `upsert` met `onConflict` vereist dat de opgegeven kolom een UNIQUE constraint heeft, anders kan Postgres niet bepalen welk record bijgewerkt moet worden
- Na deze migratie zal elke company maximaal 1 rij in `seo_settings` en 1 rij in `blog_settings` kunnen hebben (wat de bedoeling is)
- Bestaande data wordt niet aangetast, mits er geen duplicaten zijn (er zou per company maar 1 record moeten bestaan)

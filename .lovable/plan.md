

## Auto-selectie nieuw bedrijf + round-robin trigger

### 1. Nieuw bedrijf automatisch selecteren

**Probleem**: Na het toevoegen van een bedrijf in `AltTextCompanySelector` wordt `setSelectedCompany` intern aangeroepen, maar de `onSelect` callback naar de parent (`WordpressAltText.tsx`) wordt niet getriggerd. Hierdoor ziet de parent het nieuwe bedrijf niet als geselecteerd.

**Oplossing**: In `handleConfirmAdd` in `AltTextCompanySelector.tsx`, na succesvolle insert, ook `onSelect?.(data)` aanroepen zodat de parent direct het nieuwe bedrijf ontvangt.

### 2. Round-robin trigger: bedrijven om de beurt

**Huidige situatie**: De edge function `run-scheduled-alt-text` verwerkt ALLE bedrijven tegelijk bij elke trigger.

**Nieuwe situatie**: Bij elke trigger wordt slechts 1 bedrijf verwerkt. Het systeem houdt bij welk bedrijf als laatste is verwerkt en pakt het volgende bedrijf in de lijst. Na het laatste bedrijf begint het weer bij het eerste.

**Database**: Voeg een kolom `last_processed_company_id` (UUID, nullable) toe aan `alt_text_schedules` om bij te houden welk bedrijf het laatst is verwerkt.

**Edge function logica**:
1. Haal het schema op + `last_processed_company_id`
2. Haal alle bedrijven op, gesorteerd op `created_at ASC`
3. Zoek het volgende bedrijf na `last_processed_company_id` (of het eerste als het null is of het vorige bedrijf niet meer bestaat)
4. Verwerk alleen dat ene bedrijf
5. Sla het verwerkte `company_id` op in `last_processed_company_id`
6. Werk `last_triggered_at` en `next_trigger_at` bij

### 3. Start-knop: alleen geselecteerd bedrijf

Dit werkt al correct -- de `handleStart` functie stuurt alleen de gegevens van `selectedCompany` naar de webhook.

### Aanpassingen

**Database migratie**:
```sql
ALTER TABLE alt_text_schedules 
  ADD COLUMN last_processed_company_id UUID;
```

**`src/components/wordpress-alt-text/AltTextCompanySelector.tsx`**:
- In `handleConfirmAdd`: voeg `onSelect?.(data as AltTextCompany)` toe na succesvolle insert

**`supabase/functions/run-scheduled-alt-text/index.ts`**:
- Haal bedrijven op gesorteerd op `created_at ASC`
- Bepaal het volgende bedrijf op basis van `last_processed_company_id`
- Verwerk alleen dat ene bedrijf
- Update `last_processed_company_id` na verwerking

### Technische details

**Round-robin logica in de edge function:**
```text
companies = alle bedrijven gesorteerd op created_at ASC
lastId = schedule.last_processed_company_id

if lastId is null:
  nextCompany = companies[0]
else:
  index = companies.findIndex(c => c.id === lastId)
  nextCompany = companies[(index + 1) % companies.length]

// Verwerk nextCompany
// Update last_processed_company_id = nextCompany.id
```

Dit zorgt ervoor dat bij elke trigger-aanroep het volgende bedrijf in de rij aan de beurt is, en na het laatste bedrijf wordt weer begonnen bij het eerste.

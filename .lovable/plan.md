

## Alle bedrijven sequentieel verwerken in 1 trigger-run

### Probleem

De huidige edge function verwerkt slechts 1 bedrijf per trigger-aanroep (round-robin). De gebruiker wil dat wanneer de trigger afgaat, ALLE bedrijven na elkaar worden verwerkt in dezelfde run.

### Oplossing

De edge function `run-scheduled-alt-text` aanpassen zodat hij door ALLE bedrijven heen loopt in een `for`-loop. Per bedrijf wordt de webhook aangeroepen, het antwoord afgewacht, en dan door naar het volgende bedrijf. De `last_processed_company_id` kolom wordt niet meer nodig voor round-robin maar kan blijven voor logging.

### Aanpassingen

**`supabase/functions/run-scheduled-alt-text/index.ts`**:

- Vervang de "kies 1 bedrijf" logica door een loop over ALLE bedrijven
- Per bedrijf: stuur POST request naar de webhook, wacht op response, log resultaat
- Ga door naar het volgende bedrijf ongeacht of het vorige succesvol was
- Na afloop: update `last_triggered_at`, bereken en sla `next_trigger_at` op
- Rapporteer het totaal aantal verwerkte en mislukte bedrijven

### Technische details

```text
Huidige flow:
  1. Pak 1 bedrijf (round-robin)
  2. Stuur webhook
  3. Update schedule + next_trigger_at

Nieuwe flow:
  1. Pak ALLE bedrijven (gesorteerd op created_at ASC)
  2. Voor elk bedrijf:
     a. Stuur webhook POST request
     b. Wacht op response
     c. Log succes/fout
  3. Na de loop: update schedule met last_triggered_at en next_trigger_at
```

De `last_processed_company_id` wordt geüpdatet naar het laatst verwerkte bedrijf (voor logging/debugging), maar heeft geen functionele rol meer in de selectie.


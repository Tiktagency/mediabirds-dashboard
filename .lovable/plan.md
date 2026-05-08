

## Layout herindeling + globale trigger voor alle bedrijven

### 1. Animatie-paneel: rechter panel verwijderen, linker panel naast invulvelden

**Huidige situatie**: Twee panelen (voor/na) met pijl ertussen, boven de invulvelden.

**Nieuwe situatie**: Alleen het linker paneel (met fill-animatie) blijft over. Dit paneel wordt rechts naast de invulvelden geplaatst in een horizontale layout:

```
+-----------------------------------------------+
|  Dashboard                        [Dropdown]   |
+-----------------------------------------------+
|           Alt-tekst wordpress                  |
|                                                |
|   [== Automatische Trigger (alle bedrijven) =] |
|                                                |
|  +---------------------+  +------------------+ |
|  | Bedrijfsnaam:        |  | Alt. tekst: [  ] | |
|  | [Reneko Kozijnen  ]  |  | Titel: [      ]  | |
|  | Domeinnaam:          |  | Bijschrift: [  ] | |
|  | [reneko.nl        ]  |  | Beschrijving:[ ] | |
|  +---------------------+  +------------------+ |
|              [ Start ]                         |
+-----------------------------------------------+
```

Bij klik op "Start" worden de velden in het rechter WordPress-paneel een-voor-een gevuld (animatie blijft).

### 2. Globale automatische trigger (voor ALLE bedrijven)

Net als bij de blogs komt er een ScheduleTrigger-component, maar deze werkt voor **alle** alt-tekst bedrijven tegelijk. Wanneer het schema afgaat, wordt de webhook aangeroepen voor elk bedrijf in `alt_text_companies`.

### Aanpassingen

**Database: nieuwe tabel `alt_text_schedules`**
- Eenmalige rij (geen `company_id`) met dezelfde structuur als `blog_schedules`:
  - `id`, `enabled`, `interval_value`, `interval_unit`, `day_of_week`, `time_of_day`, `last_triggered_at`, `next_trigger_at`, `created_at`, `updated_at`
- RLS: alleen geauthenticeerde gebruikers kunnen lezen/schrijven

**`src/hooks/useAltTextSchedule.ts`** (nieuw)
- Kopie van `useBlogSchedule.ts`, maar leest/schrijft naar `alt_text_schedules`
- Geen `companyId` parameter nodig (globaal schema)

**`src/pages/WordpressAltText.tsx`**
- Layout wijzigen: invulvelden (links) en animatie-paneel (rechts) naast elkaar in een `flex-row`
- ScheduleTrigger component toevoegen direct onder de titel, boven de bedrijfsgegevens
- ScheduleTrigger krijgt een dummy `companyId="global"` of wordt aangepast

**`src/components/wordpress-alt-text/AltTextAnimation.tsx`**
- Verwijder het rechter paneel en de pijl
- Behoud alleen het linker paneel met de fill-animatie

**`supabase/functions/run-scheduled-alt-text/index.ts`** (nieuw)
- Haalt alle bedrijven op uit `alt_text_companies`
- Loopt over elk bedrijf en roept de alt-tekst webhook aan met `bedrijfsnaam` en `domain`
- Gebruikt `BLOG_WEBHOOK_AUTH_TOKEN` voor authenticatie
- Werkt `last_triggered_at` en `next_trigger_at` bij na succesvolle uitvoering
- Zelfde robuust patroon als `run-scheduled-blogs`

**`supabase/config.toml`**
- Nieuwe functie `run-scheduled-alt-text` registreren met `verify_jwt = false`

### Technische details

**alt_text_schedules tabel:**
```sql
CREATE TABLE alt_text_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT false,
  interval_value INTEGER DEFAULT 1,
  interval_unit TEXT DEFAULT 'weeks',
  day_of_week INTEGER DEFAULT 1,
  time_of_day TEXT DEFAULT '10:00:00',
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**run-scheduled-alt-text flow:**
1. Haal het schema op uit `alt_text_schedules` (eerste rij)
2. Check of `enabled = true` en `next_trigger_at <= now()`
3. Haal alle bedrijven op uit `alt_text_companies`
4. Loop over elk bedrijf, stuur POST naar de webhook
5. Na succes: update `last_triggered_at` en bereken `next_trigger_at`

**ScheduleTrigger hergebruik:**
De bestaande `ScheduleTrigger` component wordt hergebruikt. De `useAltTextSchedule` hook levert dezelfde interface (`schedule`, `isLoading`, `isSaving`, `updateSchedule`, `getNextTriggerDisplay`).


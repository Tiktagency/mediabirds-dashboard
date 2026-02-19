
## Landingspagina: eigen automatische trigger losmaken van WordPress Alt Text

### Probleem

De Landingspagina gebruikt momenteel `useAltTextSchedule`, die leest en schrijft naar de `alt_text_schedules` tabel. Dit betekent dat de automatische trigger van de Landingspagina en die van WordPress Alt Text dezelfde instellingen delen -- als je de ene aan/uitzet, verandert de andere mee.

### Oplossing

Een volledig eigen schedule-systeem aanmaken voor de Landingspagina, bestaande uit 4 onderdelen:

---

### 1. Nieuwe database tabel: `landing_schedules`

Zelfde structuur als `alt_text_schedules`, maar volledig onafhankelijk:

- `id` (uuid, primary key)
- `enabled` (boolean, default false)
- `interval_value` (integer, default 1)
- `interval_unit` (text, default 'weeks')
- `day_of_week` (integer, default 1)
- `time_of_day` (time, default '10:00:00')
- `last_triggered_at` (timestamptz, nullable)
- `next_trigger_at` (timestamptz, nullable)
- `last_processed_company_id` (uuid, nullable)
- `created_at`, `updated_at` (timestamptz)
- RLS policies voor authenticated users

### 2. Nieuwe hook: `src/hooks/useLandingSchedule.ts`

Kopie van `useAltTextSchedule` maar leest/schrijft naar `landing_schedules` in plaats van `alt_text_schedules`.

### 3. Nieuwe edge function: `supabase/functions/run-scheduled-landing/index.ts`

Gebaseerd op `run-scheduled-alt-text`, maar:
- Leest schedule uit `landing_schedules`
- Leest bedrijven uit `landing_companies`
- Stuurt webhook naar de landing webhook URL (`https://tikt.app.n8n.cloud/webhook/a726f693-304a-4400-b08c-40d2748517f8`)
- Stuurt `spreadsheet_id`, `grid_id`, en `page_url` mee per bedrijf

### 4. Cron job voor `run-scheduled-landing`

Database cron job die elke 5 minuten de nieuwe edge function aanroept, net als de bestaande `run-scheduled-alt-text-job`.

### 5. Aanpassing `src/pages/Landingspagina.tsx`

- Vervang `import { useAltTextSchedule }` door `import { useLandingSchedule }`
- Gebruik de nieuwe hook zodat de schedule volledig los staat van WordPress Alt Text

### Technische details

| Onderdeel | Oud (gedeeld) | Nieuw (eigen) |
|---|---|---|
| Tabel | `alt_text_schedules` | `landing_schedules` |
| Hook | `useAltTextSchedule` | `useLandingSchedule` |
| Cron edge function | `run-scheduled-alt-text` | `run-scheduled-landing` |
| Cron job | `run-scheduled-alt-text-job` | `run-scheduled-landing-job` |

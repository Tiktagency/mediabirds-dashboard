

## "Extra instructie" veld toevoegen aan Blog Generatie

### Wat wordt er aangepast

Een nieuw optioneel tekstveld "Extra instructie" wordt toegevoegd onder het Taal-veld in het Blog Generatie formulier. De waarde wordt opgeslagen in de database en meegestuurd in de webhook payload (zowel handmatig als gepland).

### Database

Een nieuwe kolom `extra_instructie` (text, nullable) wordt toegevoegd aan de `blog_settings` tabel via een migratie.

### Wijzigingen per bestand

| Bestand | Aanpassing |
|---|---|
| Database migratie | `ALTER TABLE blog_settings ADD COLUMN extra_instructie text;` |
| `src/hooks/useBlogSettings.ts` | `extra_instructie` toevoegen aan het `BlogSettings` interface |
| `src/components/seo-blog/BlogGenerationForm.tsx` | Veld toevoegen aan formData state, laden uit settings, renderen na Taal, en meesturen in webhook payload als `extra_instructie` (leeg = `""`) |
| `supabase/functions/run-scheduled-blogs/index.ts` | `extra_instructie` uit blogSettings meesturen in de scheduled payload |

### Gedrag

- Het veld gebruikt hetzelfde drie-stappen klik-patroon als de andere velden (collapsed, expanded, editing)
- Het veld is **niet verplicht** — de `isFormComplete()` validatie wordt niet aangepast
- Als de waarde leeg is, wordt `""` meegestuurd in de webhook payload
- Het veld wordt gerenderd als een `textarea` type via de bestaande `renderField` helper


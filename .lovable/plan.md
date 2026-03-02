
## Plan: Nieuwsbrief invulvelden aanpassen

### Wat verandert er

De huidige velden (`bedrijfsnaam`, `bedrijfsinformatie`, `schrijfstijl`) en kleuren (`achtergrond_kleur`, `primaire_kleur`, `accent_kleur`) worden vervangen door de volledige set velden uit het JSON-voorbeeld.

### Nieuwe velden

**Tekstvelden:**
- `bedrijfsnaam`
- `tagline`
- `bedrijfsomschrijving`
- `doelgroep`
- `toon`
- `cta_tekst`
- `cta_url`
- `website`

**Kleurvelden:**
- `primaire_kleur`
- `secundaire_kleur`
- `achtergrond_kleur`
- `kaart_achtergrond`
- `tekst_kleur`
- `subtekst_kleur`
- `accent_kleur`
- `cta_tekst_kleur`
- `footer_achtergrond`
- `footer_tekst_kleur`

### Database migratie

De `newsletter_settings` tabel mist de nieuwe kolommen. Een migratie voegt toe:
- `tagline text`
- `bedrijfsomschrijving text` (aparte kolom naast bestaande `bedrijfsinformatie`)
- `doelgroep text`
- `toon text`
- `cta_tekst text`
- `cta_url text`
- `website text`
- `secundaire_kleur text`
- `kaart_achtergrond text`
- `tekst_kleur text`
- `subtekst_kleur text`
- `cta_tekst_kleur text`
- `footer_achtergrond text`
- `footer_tekst_kleur text`

**Let op**: `bedrijfsinformatie` blijft bestaan als alias voor `bedrijfsomschrijving` om bestaande data te behouden. De nieuwe kolom wordt `bedrijfsomschrijving`.

### Wijzigingen

| Bestand | Aanpassing |
|---|---|
| Database | Nieuwe kolommen toevoegen aan `newsletter_settings` |
| `src/hooks/useNewsletterSettings.ts` | Interface en logica uitbreiden met alle nieuwe velden |
| `src/pages/Nieuwsbrief.tsx` | Alle nieuwe tekst- en kleurvelden tonen in de sidebar |
| `supabase/functions/trigger-newsletter-webhook/index.ts` | Volledige payload met alle nieuwe velden naar webhook sturen |

### Webhook payload

```json
{
  "bedrijfsnaam": "...",
  "tagline": "...",
  "bedrijfsomschrijving": "...",
  "doelgroep": "...",
  "toon": "...",
  "cta_tekst": "...",
  "cta_url": "...",
  "website": "...",
  "primaire_kleur": "#...",
  "secundaire_kleur": "#...",
  "achtergrond_kleur": "#...",
  "kaart_achtergrond": "#...",
  "tekst_kleur": "#...",
  "subtekst_kleur": "#...",
  "accent_kleur": "#...",
  "cta_tekst_kleur": "#...",
  "footer_achtergrond": "#...",
  "footer_tekst_kleur": "#...",
  "rss_feeds": [...],
  "user_id": "..."
}
```

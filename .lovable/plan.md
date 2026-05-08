
## Plan: Bedrijven selector toevoegen aan Nieuwsbrief pagina

### Wat er verandert

De Nieuwsbrief pagina krijgt dezelfde header-layout als de Alt-tekst pagina: Dashboard-knop links, bedrijven-selector rechts, beide absoluut boven de content. De content-titel schuift omlaag naar `pt-32`.

De bedrijven-selector werkt volledig los van andere pagina's — eigen `newsletter_companies` tabel in de database. Per bedrijf worden alle instellingen opgeslagen (bedrijfsnaam, tagline, kleuren, etc.). Wisselen van bedrijf laadt direct die bedrijfsgegevens.

### Database migratie

Nieuwe tabel `newsletter_companies` met dezelfde kolommen als de huidige `newsletter_settings` (minus `user_id` en `generated_html`), plus een `name` kolom voor de weergavenaam in het dropdown-menu. RLS policies zodat ingelogde gebruikers alle records kunnen lezen/schrijven.

```sql
create table newsletter_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bedrijfsnaam text, tagline text, bedrijfsomschrijving text,
  doelgroep text, toon text, cta_tekst text, cta_url text, website text,
  rss_feeds text[] default '{}',
  primaire_kleur text default '#FF6B2C',
  secundaire_kleur text default '#1A2B5E',
  achtergrond_kleur text default '#F5F3EF',
  kaart_achtergrond text default '#FFFFFF',
  tekst_kleur text default '#1A1A2E',
  subtekst_kleur text default '#6B7280',
  accent_kleur text default '#FFF0E8',
  cta_tekst_kleur text default '#FFFFFF',
  footer_achtergrond text default '#1A2B5E',
  footer_tekst_kleur text default '#E8EDF7',
  generated_html text,
  created_at timestamptz default now()
);
```

### Nieuwe component

`src/components/nieuwsbrief/NewsletterCompanySelector.tsx` — kopie van de structuur van `AltTextCompanySelector` maar:
- Gebruikt `newsletter_companies` tabel
- Geen `domain`/`app_password` velden bij toevoegen — alleen `name`
- Geeft het volledige company-object terug via `onSelect`

### Wijzigingen in Nieuwsbrief.tsx

1. Absolute header bar toevoegen: `absolute top-6 left-6 right-6 z-10 flex items-center justify-between`
2. Content `pt-8` → `pt-32`
3. Geselecteerd bedrijf laadt alle settings in de form-velden
4. Opslaan schrijft terug naar `newsletter_companies` (ipv `newsletter_settings`)

### Bestanden

| Bestand | Aanpassing |
|---|---|
| Database | Nieuwe tabel `newsletter_companies` |
| `src/components/nieuwsbrief/NewsletterCompanySelector.tsx` | Nieuw component |
| `src/pages/Nieuwsbrief.tsx` | Header layout + bedrijf-selector integratie |
| `src/hooks/useNewsletterSettings.ts` | Aanpassen om per company-id te werken |

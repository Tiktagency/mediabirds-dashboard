
## Plan: Nieuwsbrief Dashboard Tile & Pagina

### Overzicht

Een nieuwe "Nieuwsbrief" tile toevoegen aan het dashboard, met een bijbehorende pagina (`/nieuwsbrief`) die een twee-koloms layout heeft: links invulvelden, rechts een HTML-preview viewer.

---

### Wat er gebouwd wordt

**1. Database migratie** — Nieuwe tabel `newsletter_settings` met kolommen:
- `id`, `user_id`, `bedrijfsnaam`, `bedrijfsinformatie`, `schrijfstijl`, `rss_feeds` (JSONB array), `achtergrond_kleur`, `primaire_kleur`, `accent_kleur`, `generated_html`, `created_at`, `updated_at`
- RLS: ingelogde gebruikers kunnen hun eigen settings beheren

**2. Backend edge function** — `trigger-newsletter-webhook`
- Stuurt de ingevulde velden naar een N8N webhook (zelfde patroon als andere automations)
- Retourneert gegenereerde HTML nieuwsbrief

**3. Nieuwe route** — `src/pages/Nieuwsbrief.tsx`

Layout (twee kolommen, huisstijl):
```text
┌──────────────────────────────────────────────────┐
│  ← Terug    Nieuwsbrief                          │
├──────────────────┬───────────────────────────────┤
│  INVULVELDEN     │  HTML PREVIEW                 │
│                  │                               │
│  Bedrijfsnaam    │  [iframe / dangerouslySetInner│
│  ─────────────   │   HTML preview van gegener-  │
│  Bedrijfs-       │   eerde nieuwsbrief]          │
│  informatie      │                               │
│  ─────────────   │  Geen preview beschikbaar     │
│  Schrijfstijl    │  → klik Genereer              │
│  ─────────────   │                               │
│  RSS Feed(s)     │                               │
│  [Feed 1   ][x]  │                               │
│  [Feed 2   ][x]  │                               │
│  [+ Voeg toe ]   │                               │
│  ─────────────   │                               │
│  🎨 Kleuren      │                               │
│  Achtergrond ●   │                               │
│  Primair     ●   │                               │
│  Accent      ●   │                               │
│                  │                               │
│  [Genereer    ]  │                               │
│  [nieuwsbrief ]  │                               │
└──────────────────┴───────────────────────────────┘
```

Specifieke UI-keuzes:
- Linker kolom: `w-[420px]` vaste breedte, scrollbaar, huisstijl cards
- Velden gebruiken hetzelfde drie-stap klik-patroon als SEO Blog (collapsed label → expanded → edit mode) voor een nette, compacte weergave — of een eenvoudiger altijd-zichtbaar formulier (beter voor nieuw scherm)
- RSS feeds: dynamische lijst met `+` knop en `×` verwijder knop per feed, max 5 feeds
- Kleurpickers: native `<input type="color">` met hex display, zelfde stijl als BlogGenerationForm
- Rechter kolom: `flex-1`, iframe sandbox voor veilige HTML rendering
- Genereer knop: primary style, volledig breed, onderaan linker kolom
- Loading state met spinner tijdens generatie

**4. Hook** — `src/hooks/useNewsletterSettings.ts`
- Laadt/opslaat settings per `user_id` uit de database
- Auto-save bij wijzigingen (debounced)

**5. Dashboard tile toevoegen** in `src/pages/Index.tsx`
- Nieuw item in `tileConfigMap`: `'nieuwsbrief'` met `Newspaper` icon, route `/nieuwsbrief`, variant `'secondary'`
- GRID_SIZE verhogen van 9 naar 10 (of auto-inject via bestaande logica)

**6. TileOrganizer updaten** in `src/components/admin/dashboard/TileOrganizer.tsx`
- `tileConfig` object uitbreiden met `'nieuwsbrief'` entry

**7. App.tsx** — Route toevoegen: `<Route path="/nieuwsbrief" element={<Nieuwsbrief />} />`

---

### Bestanden die worden aangemaakt/aangepast

| Bestand | Actie |
|---|---|
| `supabase/migrations/` | Nieuwe tabel `newsletter_settings` |
| `supabase/functions/trigger-newsletter-webhook/index.ts` | Nieuwe edge function |
| `src/pages/Nieuwsbrief.tsx` | Nieuwe pagina |
| `src/hooks/useNewsletterSettings.ts` | Nieuwe hook |
| `src/pages/Index.tsx` | `tileConfigMap` + GRID_SIZE uitbreiden |
| `src/components/admin/dashboard/TileOrganizer.tsx` | `tileConfig` uitbreiden |
| `src/App.tsx` | Route toevoegen |

---

### Database migratie (SQL)

```sql
CREATE TABLE public.newsletter_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bedrijfsnaam text,
  bedrijfsinformatie text,
  schrijfstijl text,
  rss_feeds jsonb DEFAULT '[]'::jsonb,
  achtergrond_kleur text DEFAULT '#ffffff',
  primaire_kleur text DEFAULT '#000000',
  accent_kleur text DEFAULT '#4f46e5',
  generated_html text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own newsletter settings"
  ON public.newsletter_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### Technisch detail: HTML Preview

De gegenereerde HTML wordt getoond in een `<iframe srcDoc={html}>` met sandbox-attribuut voor veilige rendering. Zolang er geen gegenereerde HTML is, toont de rechterkant een placeholder met uitleg.

De "Genereer nieuwsbrief" knop roept de edge function aan. Het resultaat (HTML string) wordt opgeslagen in state én in de database.

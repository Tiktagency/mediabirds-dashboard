
## Plan: RSS feed velden werken precies als de Pagina URL velden

### Verschil tussen de twee implementaties

**PageUrlForm (Pagina URL):**
- Elke URL heeft zijn eigen drie-stap cycle: collapsed (klikbaar compact vakje) → expanded (volledige tekst + potlood) → editing (Input + autoFocus, opslaan op blur)
- Elk veld heeft een unieke `fieldId` (`url_0`, `url_1`, enz.)
- "URL toevoegen" knop voegt een nieuw leeg veld toe dat direct in editing-state springt
- Verwijder-knop naast elk veld

**Nieuwsbrief RSS feeds (huidig):**
- De héle RSS-sectie heeft één gedeelde state (collapsed/expanded/editing voor de hele lijst)
- Editing state toont een los invoerveld + Plus-knop
- Niet per feed individueel bewerkbaar

### Aanpak: RSS feeds omzetten naar het PageUrlForm patroon

**Per-feed drie-stap state:**
- `editingField` wordt uitgebreid: in plaats van `'rss_feeds'` als één string, wordt elk feed-veld `'rss_feed_0'`, `'rss_feed_1'`, etc.
- `expandedField` idem: `'rss_feed_0'`, etc.
- `AnyField` type bijwerken

**`renderRssFeedItem(index, url)` helper:**
Zelfde structuur als `renderInputField` in PageUrlForm:
1. **Collapsed**: `h-[40px]` klikbaar div → `setExpandedField('rss_feed_N')`
2. **Expanded**: volledige URL-tekst + potlood-knop → `setEditingField('rss_feed_N')`
3. **Editing**: `Input` met autoFocus, `onBlur` → wijziging opslaan in `settings.rss_feeds[index]`

**Save-logica per feed:**
```tsx
const handleSaveFeed = (index: number, value: string) => {
  setEditingField(null);
  const newFeeds = [...settings.rss_feeds];
  if (value.trim()) {
    newFeeds[index] = value.trim();
  } else {
    newFeeds.splice(index, 1); // Lege waarde = verwijderen
  }
  if (JSON.stringify(newFeeds) !== JSON.stringify(settings.rss_feeds)) {
    saveSettings({ rss_feeds: newFeeds });
    toast({ title: 'Opgeslagen' });
  }
};
```

**"Feed toevoegen" knop:**
Voegt een leeg item toe aan `settings.rss_feeds` (via lokale lijst) en zet die direct in editing-state (`editingField = 'rss_feed_N'`).

Omdat de feeds uit `settings` komen (geen lokale array meer voor de feed-waarden), werken we met een lokale `localFeeds` state die gesynchroniseerd wordt met `settings.rss_feeds`, precies zoals `localData` werkt voor de tekstvelden.

**Verwijder-knop:**
Blijft naast elk veld, roept direct `saveSettings({ rss_feeds: ... })` aan (zelfde als nu).

**Click-outside handler:**
Vereenvoudigd: bij elke `rss_feed_*` field geldt dezelfde logica als de tekstvelden — `setEditingField(null)` + `setExpandedField(null)`.

**Label:**
`RSS feeds` met counter `(N/5)` blijft boven de lijst staan.

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | RSS feeds omzetten naar per-feed drie-stap patroon (identiek aan PageUrlForm) |

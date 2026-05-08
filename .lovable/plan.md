
## Analyse van het RSS feed probleem

### Wat er mis gaat

In de sessie replay is duidelijk te zien wat er fout gaat:

1. Gebruiker klikt op collapsed RSS-veld → `expandedField = 'rss_feeds'` → expanded state toont zich
2. Expanded state heeft een potlood-icoon; gebruiker klikt erop → `editingField = 'rss_feeds'`
3. In editing state voert de gebruiker een URL in het input veld in
4. De gebruiker klikt op de Plus-knop → `addFeed()` wordt aangeroepen → `saveSettings({ rss_feeds: [...] })`
5. **Bug**: Na `addFeed()` wordt `newFeed` geleegd en de feed wordt opgeslagen, maar er is geen expliciete state-transitie. De editing state blijft actief. **Dan klikt de gebruiker buiten het veld** → de `mousedown` listener vuurt af → `setEditingField(null)` + `setExpandedField(null)` → collapsed state.

**Het eigenlijke probleem**: De collapsed state toont `feedCount` vanuit `settings.rss_feeds.length`. Na `saveSettings()` wordt de `settings` state in de hook **optimistisch geüpdatete** (via `setSettings(merged)`), maar er is een subtiele bug: de `saveSettings` hook doet een debounce van 800ms. Tijdens die 800ms is de lokale `settings` wel bijgewerkt, maar als de `mousedown` handler net op dat moment afvuurt en `setExpandedField(null)` aanroept VOORDAT de settings zijn bijgewerkt in de component...

Wacht, laat me beter kijken. In de `useNewsletterSettings` hook:

```typescript
const saveSettings = useCallback(async (updated: Partial<NewsletterSettings>) => {
    const merged = { ...settings, ...updated } as NewsletterSettings;
    setSettings(merged);  // ← Optimistische update
    // debounce...
```

De optimistische update zet `settings` direct. Dus `feedCount` zou direct moeten tonen... TENZIJ er een React re-render timing issue is.

**Het echte probleem**: De `renderRssFeeds` functie leest `feedCount` van `settings.rss_feeds.length`. Maar de `expandedRef` is **gedeeld** tussen alle expanded/editing states van alle velden. Als een tekstfield zoals `bedrijfsnaam` ook expanded is, heeft `expandedRef` die container, niet de RSS feed container. Dan werkt de click-outside handler verkeerd.

Maar nog specifieker: Kijkend naar de sessie replay:
- De gebruiker ziet `"RSS feeds" en "5/0"` na de transitie — dat is `({feedCount}/{MAX_RSS_FEEDS})` dus 5 feeds al aanwezig maar `feedCount` is 0? Nee, de volgorde is `(feedCount/MAX_RSS_FEEDS)`, dus `5` feeds en max is `5`. Maar dat klopt niet met de databankrespons die `rss_feeds: []` toont.

**Werkelijk probleem gevonden**: De sessie replay toont `"RSS feeds" en "5/0"` — dit is OMGEKEERD. De Label toont `({feedCount}/{MAX_RSS_FEEDS})` maar het lijkt `5/0` te tonen. Dit suggereert dat de counter iets anders weergeeft.

Eigenlijk: na het toevoegen van een feed klikt de gebruiker weg, en de velden gaan naar collapsed. Maar in collapsed state staat `"Geen feeds toegevoegd"`. Dit suggereert dat na het klikken op Plus:
1. `addFeed()` roept `saveSettings({ rss_feeds: [...settings.rss_feeds, trimmed] })` aan
2. `settings` wordt optimistisch bijgewerkt IN de hook
3. Maar daarna: de `mousedown` event vuurt af EN treft de click-outside handler
4. `setEditingField(null)` + `setExpandedField(null)` → collapsed
5. De collapsed state toont `settings.rss_feeds.length` — maar als de optimistische update al is gedaan, zou dit 1 moeten zijn

**De echte bug**: In `addFeed()` wordt `setNewFeed('')` aangeroepen, maar er is geen `setEditingField(null)` of `setExpandedField(null)`. Na het klikken op de Plus-button, blijft `editingField === 'rss_feeds'`. Het veld toont nu de editing state maar met de nieuwe feed erin (want `settings.rss_feeds` bevat die).

Maar de gebruiker klikt WEG na het invoeren — de `mousedown` listener pakt dat op. MAAR: als de gebruiker op de Plus-button klikt, is dat een `mousedown` event OP de Plus-button die IN de `expandedRef` container zit. Dus de click-outside handler zou NIET moeten activeren.

Wacht — kijkend naar de session replay: de gebruiker typt een URL, klikt dan (ergens buiten), en daarna staat er "Geen feeds toegevoegd". De gebruiker heeft NIET op Plus geklikt — ze hebben de URL ingetypt en toen weggeblurd. `onBlur` is niet geconfigureerd op de RSS input. Er is geen `onBlur` op het invoerveld in de editing state van RSS. Dus het veld gaat gewoon weg via de click-outside, ZONDER de feed op te slaan!

**Dat is de bug**: De gebruiker typt een URL in het RSS invoerveld en klikt weg — maar er is geen `onBlur` op het input die `addFeed()` aanroept. De feed wordt dus nooit opgeslagen. De Plus-knop moet expliciet worden aangeklikt.

**Bijkomend probleem**: De click-outside handler gaat van editing-state direct naar collapsed (door zowel `setEditingField(null)` als `setExpandedField(null)` te zetten), waardoor de gebruiker niet eens ziet dat er al feeds zijn (als die er zijn).

### Fix

1. **Voeg `onBlur` toe aan het RSS input veld**: Als de gebruiker wegklikt terwijl er tekst in staat, automatisch `addFeed()` aanroepen.

2. **Betere click-outside transitie**: Van editing → collapsed (niet editing → expanded), maar er is een conflict: als de gebruiker wegklikt na het typen van een URL, wordt eerst `onBlur` getriggerd (→ addFeed), dan `mousedown` (→ setExpandedField null). Dat is eigenlijk OK.

3. **Expliciete "Opslaan" stap voor feeds**: Overweeg of na klikken op Plus, we direct terug naar collapsed state gaan met een toast, net als bij de tekstvelden. Dit maakt de UX consistent.

### Plan

**`src/pages/Nieuwsbrief.tsx`**:

**A. `onBlur` op RSS input veld**: Voeg `onBlur={() => { if (newFeed.trim()) addFeed(); }}` toe aan het input element in de editing state.

**B. Na `addFeed()` blijf in editing state** maar reset `newFeed` correct (dat gebeurt al). Gebruik `onMouseDown` op de Plus-button ipv `onClick` om te voorkomen dat `onBlur` eerst de feed toevoegt en dan de Plus-button ook.

**C. Verbeter de `mousedown` click-outside handler** voor RSS: ga van editing naar collapsed (via expanded tussenstation of direct), zodat de feeds wel zichtbaar zijn na wegklikken.

**D. Voeg `onBlur` toe dat de editing state sluit én naar expanded gaat** zodat gebruiker ziet wat er staat, ipv direct naar collapsed.

Concreet:
- `onBlur` op RSS input: `addFeed()` als er tekst staat, dan `setEditingField(null)` (maar niet `setExpandedField(null)`)
- Click-outside handler: als `editingField === 'rss_feeds'`, ga naar `expandedField = 'rss_feeds'` (niet null), zodat de feeds zichtbaar zijn
- Plus-button: gebruik `onMouseDown` + `preventDefault()` zodat de input `onBlur` niet vuurt bij klik op Plus

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | `onBlur` op RSS input, verbeterde click-outside transitie voor RSS feeds |

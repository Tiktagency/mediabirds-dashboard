
## Analyse van de drie gevraagde wijzigingen

### 1. Three-step patroon voor RSS feed invulveld
Het huidige RSS-gedeelte toont bestaande feeds als verwijderbare badges en een simpel Input + Plus-knop formulier voor nieuwe feeds. Dit moet het three-step patroon volgen:
- **Collapsed**: compact vakje dat "Geen feeds toegevoegd" of het aantal feeds toont (`{n} feed(s) toegevoegd`)
- **Expanded**: volledige lijst met feeds + potlood-icoon om te bewerken
- **Editing**: de huidige add/remove UI (invoerveld + plus-knop + verwijder-kruisjes)

State: `editingField`/`expandedField` worden al bijgehouden — RSS feeds kunnen hieraan worden toegevoegd als een extra veld (`'rss_feeds'`).

### 2. RSS feeds meesturen via webhook
In `handleGenerate` worden de RSS feeds al meegestuurd (`rss_feeds: settings.rss_feeds`). Dat is dus correct. Echter: de localData bevat alleen `bedrijfsnaam`, `bedrijfsinformatie`, `schrijfstijl`. Als de gebruiker in editing-state is en nog niet heeft opgeslagen (blur), worden de **niet-opgeslagen wijzigingen niet meegestuurd**. 

De fix: in `handleGenerate` de localData gebruiken voor de drie tekstvelden in plaats van `settings`, zodat altijd de meest recente waarden worden verstuurd.

### 3. Kopjes niet in capslock
Alle `Label`/`span` elementen hebben nu `uppercase tracking-wide` klassen. Die moeten worden verwijderd. Specifiek:
- Regel 27: `ColorField` component — `uppercase tracking-wide` verwijderen
- Regel 99, 126, 145: in `renderField` — `uppercase tracking-wide` verwijderen  
- Regel 268: RSS Feeds label — `uppercase tracking-wide` verwijderen
- Regel 320: Huisstijl kleuren label — `uppercase tracking-wide` verwijderen

### Plan

**Bestand: `src/pages/Nieuwsbrief.tsx`**

**A. Kopjes lowercase maken** — verwijder `uppercase tracking-wide` van alle Label/span elementen. Verwijder ook `normal-case tracking-normal` van de counter span (die was als override, nu niet meer nodig).

**B. RSS Feeds three-step patroon:**
- Collapsed: klikbaar `div` met `h-[40px]` die toont hoeveel feeds er zijn (of "Geen feeds toegevoegd" italic als leeg)
- Expanded (ref container): volledige feed-lijst met verwijder-kruisjes + potlood-icoon rechts bovenaan
- Editing: huidige add-input UI + lijst met verwijder-kruisjes, klik buiten = opslaan & collapse

Implementatie via uitbreiding van `editingField`/`expandedField` state met `'rss_feeds'` als waarde.

**C. Webhook localData gebruiken** — in `handleGenerate` de `localData` waarden (bedrijfsnaam, bedrijfsinformatie, schrijfstijl) meesturen in plaats van `settings.*`, zodat niet-opgeslagen editing-state ook meekomt.

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | RSS feeds three-step, lowercase labels, webhook localData fix |

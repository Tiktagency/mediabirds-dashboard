
## Plan: Nauwkeurigere kleurextractie voor subtekst, kaart achtergrond, secundaire kleur en achtergrond

### Kernprobleem
De AI krijgt te vage omschrijvingen voor de vier lastige velden. Hierdoor raadt de AI kleuren die niet overeenkomen met wat er visueel op de website staat. De oplossing zit volledig in betere prompt-instructies en tool descriptions.

### Verbeterde beschrijvingen per veld

**`achtergrond_kleur`** — Huidige beschrijving is te generiek. Verbetering: expliciet instrueren dat dit de `background-color` van `<body>`, `html` of de buitenste wrapper `<div>` is. CSS-variabelen zoals `--background`, `--bg-color`, `--body-bg` zijn goede bronnen. Moet de kleur zijn die je ziet als je naar de lege pagina kijkt vóór enige content.

**`kaart_achtergrond`** — AI interpreteert dit te breed. Verbetering: expliciete instructie dat dit de achtergrond is van herhalende content-blokken (`.card`, `.block`, `section` met een eigen achtergrond). Als de kaartachtergrond gelijk is aan de pagina-achtergrond, mag de pagina-achtergrond worden gebruikt. Mag dezelfde kleur zijn als `achtergrond_kleur`.

**`secundaire_kleur`** — AI verzint een kleur als die niet duidelijk aanwezig is. Verbetering: instructie dat als er geen duidelijke secundaire merkkleur is, dezelfde kleur als `primaire_kleur` of een donkere/lichte variant van de primaire kleur moet worden gebruikt — nooit een willekeurige kleur.

**`subtekst_kleur`** — AI gebruikt soms de hoofdtekstkleur. Verbetering: expliciete instructie te zoeken naar `color` van `.subtitle`, `.meta`, `.caption`, `p.secondary`, `span.muted`, of CSS-variabelen zoals `--text-secondary`, `--muted`, `--text-muted`. Als geen subtekstkleur bestaat, mag een lichter grijstint van de `tekst_kleur` worden gebruikt (bijv. als `tekst_kleur` donkergrijs is, gebruik dan `#6B7280` of vergelijkbaar).

### Aanpak: Twee-staps analyse

In plaats van alles in één prompt te vragen, voeg ik aan de system prompt een **expliciete analysevolgorde** toe:
1. Eerst: zoek CSS-variabelen in `<style>` tags (meest betrouwbare bron)
2. Dan: zoek inline styles op herkenbare elementen
3. Dan: zoek Tailwind/Bootstrap klassen
4. Voor de vier probleemvelden: schrijf expliciet welke HTML-elementen en CSS-properties relevant zijn

### Aanvullend: CSS-variabelen pre-extractie

De HTML wordt tot 80.000 tekens ingekort, maar `<style>` tags met CSS-variabelen staan bovenaan. Ik voeg een **pre-extractiestap** toe die alle CSS `<style>` tag inhoud en inline CSS-variabelen bovenaan de prompt plaatst, zodat de AI de meest relevante CSS altijd ziet — ook als de body HTML afgekapt wordt.

### Bestand

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/extract-brand-colors/index.ts` | System prompt verfijnen, tool descriptions verbeteren, CSS pre-extractie toevoegen |

### Concrete wijzigingen

1. **Pre-extractie van `<style>` tags**: alle `<style>` blokken apart extracten en bovenaan de prompt zetten
2. **Verbeterde tool descriptions** met concrete voorbeelden van HTML/CSS-selectors per veld
3. **Strengere system prompt** met expliciete instructies voor de vier probleemvelden
4. **`toHex` stricter maken**: 3-karakter hex expanden naar 6 tekens (`#F0A` → `#FF00AA`)

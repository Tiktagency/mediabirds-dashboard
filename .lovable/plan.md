
# Notities vak: volledige tekst met scroll

## Wat verandert er

Het notitieveld toont altijd alle tekst. Als de tekst te lang wordt voor het vak, verschijnt er een scrollfunctie zodat je alles kunt lezen zonder dat tekst buiten het vak valt.

## Wijzigingen

**Bestand:** `src/pages/SeoBlog.tsx`

### 1. Container aanpassen (regel 336)
- De buitenste `div` krijgt een vaste maximale hoogte en `overflow-hidden` zodat het vak niet oneindig groeit.

### 2. Ingeklapte staat verwijderen
- De "collapsed" staat (regels 350-357) met `truncate` wordt verwijderd. Het notitieveld staat altijd in "expanded" modus -- alle tekst is zichtbaar.
- `notesEditMode` gebruikt dan alleen `'expanded'` en `'editing'` (geen `'collapsed'` meer).
- De initialisatie van `notesEditMode` wordt `'expanded'` in plaats van `'collapsed'`.

### 3. Expanded staat met scroll (regels 359-365)
- Voeg `overflow-y-auto` en een `max-h` (bijvoorbeeld `max-h-[200px]`) toe aan het tekstvak zodat er een scrollbar verschijnt wanneer de tekst te lang is.
- De `onClick` op het expanded vak die terugschakelt naar `'collapsed'` wordt verwijderd (er is geen collapsed meer).

### 4. Editing textarea (regels 370-391)
- Voeg ook een `max-h-[200px] overflow-y-auto` toe aan de textarea zodat je bij veel tekst kunt scrollen tijdens het bewerken.

## Resultaat
- Je ziet altijd de volledige notitietekst
- Bij veel tekst verschijnt een scrollbar in het vak
- Klikken op de tekst doet niets meer (alleen het potlood-icoon opent de bewerkingsmodus)
- Het potlood-icoon is altijd zichtbaar

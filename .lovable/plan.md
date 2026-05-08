
## Plan: Firecrawl vervangen door AI-gebaseerde kleurextractie

### Aanpak

In plaats van Firecrawl:
1. De edge function haalt de HTML van de website op via een gewone `fetch`
2. De HTML wordt doorgegeven aan Gemini (via de Lovable AI Gateway) met een gedetailleerde prompt
3. De AI analyseert de HTML en extraheert de 10 kleurvelden als gestructureerde JSON via tool calling
4. De Firecrawl connector wordt losgekoppeld van het project

### Waarom dit beter werkt

- Geen afhankelijkheid van externe betaalde API (Firecrawl)
- AI begrijpt context: "dit is een knop", "dit is tekst", "dit is een achtergrond"
- De AI kan de instructie "geen kleuren uit afbeeldingen" naleven
- Tool calling geeft altijd gestructureerde, gevalideerde JSON terug

### Nieuwe edge function logica

```
1. Fetch HTML van de website (plain fetch, geen scraping service)
2. Strip zware tags (script, style inhoud verwijderen is niet nodig — CSS inline stijlen zijn juist nuttig)
3. Stuur HTML naar Gemini met tool calling om de 10 kleuren te extraheren
4. Valideer de teruggestuurde kleuren (toHex helper blijft behouden)
5. Return de gekoppelde kleuren
```

### Prompt voor de AI

De prompt instrueert expliciet:
- Analyseer alleen CSS-kleuren van achtergronden, tekst, knoppen en vaste vormen
- **Geen kleuren van afbeeldingen of SVG-fills die afbeeldingen zijn**
- Knoppen hebben bijna altijd witte tekst
- Dezelfde kleur mag voor meerdere velden worden gebruikt
- Return als tool call met de 10 velden

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/extract-brand-colors/index.ts` | Volledig herschrijven: Firecrawl → fetch HTML + Gemini AI |

### Firecrawl connector

Na de implementatie wordt de Firecrawl connector losgekoppeld via de connector settings. Dit is een actie die de gebruiker zelf uitvoert in Settings → Connectors.

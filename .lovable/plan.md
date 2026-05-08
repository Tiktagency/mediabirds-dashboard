
# Fix: Verwijder "E-mail signature" Overal in HTML

## Probleem
De huidige regex zoekt alleen aan het **begin** van de string (`^E-mail signature`). Maar de tekst staat waarschijnlijk:
- Ergens in het midden van de HTML content
- Gewrapt in HTML tags zoals `<p>E-mail signature</p>` of `<div>E-mail signature</div>`

## Oplossing
Vervang de beperkte `^` regex door een globale regex die "E-mail signature" overal verwijdert, inclusief wanneer het in HTML tags staat.

**Bestand:** `src/pages/EmailSignature.tsx`

### Wijzigingen in `cleanHtmlForCopy`:

Voeg deze regels toe:
```tsx
// Verwijder "E-mail signature" in HTML tags (p, div, span, etc.)
cleaned = cleaned.replace(/<(p|div|span)[^>]*>\s*E-mail signature\s*<\/\1>/gi, '');

// Verwijder "E-mail signature" als losse tekst overal in de string
cleaned = cleaned.replace(/E-mail signature\s*\n?/gi, '');
```

## Technische Details
| Regex | Werking |
|-------|---------|
| `/<(p\|div\|span)[^>]*>\s*E-mail signature\s*<\/\1>/gi` | Verwijdert `<p>E-mail signature</p>`, `<div>E-mail signature</div>`, etc. |
| `/E-mail signature\s*\n?/gi` | Verwijdert alle voorkomens van de tekst + eventuele whitespace/newline |

## Resultaat
De tekst "E-mail signature" wordt volledig verwijderd, ongeacht waar deze in de HTML staat.

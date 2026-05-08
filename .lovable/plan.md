
# Plan: HTML Preview met Proportionele Schaling

## Probleem

De email handtekening wordt momenteel samengeperst omdat de container smaller is dan de originele breedte. De gebruiker wil dat de handtekening kleiner wordt weergegeven, maar met behoud van de juiste verhoudingen.

---

## Oplossing

Gebruik CSS `transform: scale()` om de preview proportioneel te verkleinen zodat deze in de container past met behoud van de originele verhoudingen.

---

## Code Wijzigingen

**Bestand: `src/pages/EmailSignature.tsx`**

### Preview container aanpassen (regel 86-100)

De huidige implementatie:
```tsx
<div className="bg-white rounded-lg p-4 min-h-[200px] overflow-auto">
  {generatedHtml ? (
    <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
  ) : ...}
</div>
```

Wordt aangepast naar:
```tsx
<div className="bg-white rounded-lg p-4 min-h-[200px] overflow-hidden">
  {generatedHtml ? (
    <div 
      className="origin-top-left scale-[0.65]"
      style={{ width: '154%' }} 
      dangerouslySetInnerHTML={{ __html: generatedHtml }} 
    />
  ) : ...}
</div>
```

### Uitleg:
| CSS Property | Waarde | Functie |
|--------------|--------|---------|
| `scale-[0.65]` | 65% | Verkleint de handtekening proportioneel |
| `origin-top-left` | - | Schaalt vanaf linksboven |
| `width: 154%` | 100/0.65 ≈ 154% | Compenseert de schaling zodat de content de beschikbare ruimte benut |
| `overflow-hidden` | - | Verbergt eventuele overflow |

---

## Resultaat

- De email handtekening wordt ~65% kleiner weergegeven
- Alle verhoudingen blijven exact gelijk
- De preview past netjes in de beschikbare ruimte
- Geen horizontale scrollbalk nodig

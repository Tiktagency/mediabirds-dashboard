

# Plan: Emailhandtekening Key Correct Parsen

## Probleem

De webhook response heeft dit formaat:
```json
[{"Emailhandtekening":"<html code hier>"}]
```

De huidige code zoekt naar keys `html`, `output`, `Output`, of `message`, maar niet naar `Emailhandtekening`. Hierdoor wordt de volledige JSON string getoond in plaats van alleen de HTML waarde.

## Oplossing

### Bestand: `src/components/email-signature/EmailSignatureForm.tsx`

Pas de parsing logica aan om:
1. Te herkennen dat de response een array is (begint met `[`)
2. Het eerste element uit de array te pakken
3. De waarde van de `Emailhandtekening` key te extraheren

**Huidige code (regels 277-291):**
```typescript
if (responseData?.rawText) {
  let htmlCode = responseData.rawText;
  try {
    const parsed = JSON.parse(responseData.rawText);
    htmlCode = parsed.html || parsed.output || parsed.Output || parsed.message || responseData.rawText;
  } catch {
    // Gebruik raw text als het geen JSON is
  }
  if (typeof htmlCode === 'string') {
    htmlCode = htmlCode.replace(/^["']|["']$/g, '');
  }
  onHtmlGenerated?.(htmlCode);
}
```

**Nieuwe code:**
```typescript
if (responseData?.rawText) {
  let htmlCode = responseData.rawText;
  try {
    const parsed = JSON.parse(responseData.rawText);
    
    // Als het een array is, pak het eerste element
    const data = Array.isArray(parsed) ? parsed[0] : parsed;
    
    // Zoek de HTML in bekende keys (inclusief Emailhandtekening)
    htmlCode = data?.Emailhandtekening || 
               data?.html || 
               data?.output || 
               data?.Output || 
               data?.message || 
               responseData.rawText;
  } catch {
    // Gebruik raw text als het geen JSON is
  }
  // Verwijder omringende aanhalingstekens indien aanwezig
  if (typeof htmlCode === 'string') {
    htmlCode = htmlCode.replace(/^["']|["']$/g, '');
  }
  onHtmlGenerated?.(htmlCode);
}
```

## Technische Details

| Aspect | Aanpassing |
|--------|------------|
| Array handling | `Array.isArray(parsed) ? parsed[0] : parsed` pakt eerste element als het een array is |
| Nieuwe key | `Emailhandtekening` toegevoegd als eerste optie in de chain |
| Backwards compatible | Bestaande keys (`html`, `output`, etc.) blijven werken |

## Resultaat

De HTML code in het rechter paneel toont nu alleen de pure HTML, zonder de `[{"Emailhandtekening":"` wrapper.


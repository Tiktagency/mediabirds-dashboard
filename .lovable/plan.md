

# Plan: Toast Auto-Dismiss na 4 Seconden en HTML Output Opschonen

## Overzicht

Dit plan omvat twee aanpassingen:
1. **Toast notificaties** automatisch laten verdwijnen na 4 seconden (in plaats van handmatig sluiten)
2. **HTML code output** opschonen door aanhalingstekens te verwijderen

---

## Wijziging 1: Toast Auto-Dismiss na 4 Seconden

### Bestand: `src/hooks/use-toast.ts`

De huidige instelling `TOAST_REMOVE_DELAY = 1000000` (ongeveer 16 minuten) zorgt ervoor dat toasts praktisch nooit automatisch verdwijnen.

**Huidige code (regel 9):**
```typescript
const TOAST_REMOVE_DELAY = 1000000
```

**Nieuwe code:**
```typescript
const TOAST_REMOVE_DELAY = 4000
```

### Bestand: `src/components/ui/toaster.tsx`

De ToastProvider moet een `duration` prop krijgen om de auto-dismiss tijd in te stellen:

**Huidige code (regel 15):**
```typescript
<ToastProvider>
```

**Nieuwe code:**
```typescript
<ToastProvider duration={4000}>
```

---

## Wijziging 2: HTML Output Zonder Aanhalingstekens

### Bestand: `src/components/email-signature/EmailSignatureForm.tsx`

Na het parsen van de webhook response, worden eventuele omringende aanhalingstekens verwijderd voordat de HTML wordt doorgegeven.

**Huidige logica (regels 277-288):**
```typescript
if (responseData?.rawText) {
  let htmlCode = responseData.rawText;
  try {
    const parsed = JSON.parse(responseData.rawText);
    htmlCode = parsed.html || parsed.output || parsed.Output || parsed.message || responseData.rawText;
  } catch {
    // Gebruik raw text als het geen JSON is
  }
  onHtmlGenerated?.(htmlCode);
}
```

**Nieuwe logica:**
```typescript
if (responseData?.rawText) {
  let htmlCode = responseData.rawText;
  try {
    const parsed = JSON.parse(responseData.rawText);
    htmlCode = parsed.html || parsed.output || parsed.Output || parsed.message || responseData.rawText;
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

Dit regex-patroon `^["']|["']$` verwijdert:
- `^["']` - een aanhalingsteken aan het begin van de string
- `["']$` - een aanhalingsteken aan het einde van de string

---

## Samenvatting Wijzigingen

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/use-toast.ts` | `TOAST_REMOVE_DELAY` van 1000000 naar 4000 |
| `src/components/ui/toaster.tsx` | `duration={4000}` toevoegen aan ToastProvider |
| `src/components/email-signature/EmailSignatureForm.tsx` | Regex om aanhalingstekens te strippen van HTML output |

---

## Resultaat

1. Alle toast notificaties verdwijnen automatisch na 4 seconden
2. De HTML code in het rechter paneel bevat geen omringende `"` of `'` tekens meer




# Plan: Webhook HTML Response Tonen in HTML Code Paneel

## Huidige Situatie

- De "Handtekening genereren" knop roept de edge function aan die de data naar n8n stuurt
- De webhook response wordt wel ontvangen (`rawText` in de console logs)
- Het rechter "HTML Code" paneel toont nu alleen een placeholder tekst
- Er is geen koppeling tussen de form en het paneel (ze zijn gescheiden componenten)

## Oplossing

### 1. State Lifting naar Parent Component

**Bestand: `src/pages/EmailSignature.tsx`**

Voeg state toe voor de gegenereerde HTML code:

```typescript
const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
```

Geef een callback mee aan `EmailSignatureForm`:

```typescript
<EmailSignatureForm
  ...
  onHtmlGenerated={(html: string) => setGeneratedHtml(html)}
  onGeneratingChange={(generating: boolean) => setIsGenerating(generating)}
/>
```

Toon de HTML in het rechter paneel:

```typescript
<div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[300px] overflow-auto">
  {isGenerating ? (
    <div className="flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>HTML code genereren...</span>
    </div>
  ) : generatedHtml ? (
    <pre className="whitespace-pre-wrap break-all">{generatedHtml}</pre>
  ) : (
    <span className="text-white/30">
      Vul het formulier in en klik op "Handtekening genereren" om de HTML code te zien.
    </span>
  )}
</div>
```

Voeg ook een "Kopieer" knop toe wanneer er HTML is.

### 2. Form Component Aanpassen

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

Voeg nieuwe props toe:

```typescript
interface EmailSignatureFormProps {
  ...
  onHtmlGenerated?: (html: string) => void;
  onGeneratingChange?: (generating: boolean) => void;
}
```

In de `onSubmit` functie:

```typescript
onGeneratingChange?.(true);
setIsSending(true);

try {
  const response = await supabase.functions.invoke('trigger-email-signature', {
    body: signatureData,
  });

  // ... error handling ...

  if (data?.success && data?.rawText) {
    // Probeer JSON te parsen voor een specifieke key, anders gebruik raw text
    let htmlCode = data.rawText;
    try {
      const parsed = JSON.parse(data.rawText);
      // n8n kan HTML teruggeven in verschillende keys
      htmlCode = parsed.html || parsed.output || parsed.Output || parsed.message || data.rawText;
    } catch {
      // Gebruik raw text als het geen JSON is
    }
    onHtmlGenerated?.(htmlCode);
  }
} finally {
  setIsSending(false);
  onGeneratingChange?.(false);
}
```

### 3. Kopieer Functionaliteit

In `EmailSignature.tsx`, voeg een kopieer-knop toe:

```typescript
const copyToClipboard = async () => {
  if (generatedHtml) {
    await navigator.clipboard.writeText(generatedHtml);
    // Toast: "HTML gekopieerd naar klembord"
  }
};
```

## Samenvatting Wijzigingen

| Bestand | Wijziging |
|---------|-----------|
| `EmailSignature.tsx` | State voor `generatedHtml` en `isGenerating`, toon HTML in paneel, kopieer knop |
| `EmailSignatureForm.tsx` | Nieuwe props `onHtmlGenerated` en `onGeneratingChange`, roep callbacks aan na webhook response |

## Resultaat

1. Gebruiker vult formulier in
2. Klikt op "Handtekening genereren"
3. Paneel toont "HTML code genereren..." met spinner
4. Na ontvangst van webhook response: HTML code wordt getoond in het rechter paneel
5. Gebruiker kan de code kopiëren met een knop


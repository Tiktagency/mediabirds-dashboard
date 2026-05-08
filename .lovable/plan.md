
# Plan: Kopieer Knop Toevoegen aan Preview Sectie

## Doel
Een kopieerknop toevoegen aan de Preview card header, vergelijkbaar met de bestaande knop in de HTML Code sectie.

## Wijziging

**Bestand:** `src/pages/EmailSignature.tsx`

**Locatie:** Preview Card Header (regels 122-125)

### Huidige code:
```tsx
<CardHeader>
  <CardTitle className="text-white text-lg">Preview</CardTitle>
</CardHeader>
```

### Nieuwe code:
```tsx
<CardHeader className="flex flex-row items-center justify-between">
  <CardTitle className="text-white text-lg">Preview</CardTitle>
  {generatedHtml && (
    <Button
      variant="outline"
      size="sm"
      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
      onClick={async () => {
        await navigator.clipboard.writeText(generatedHtml);
        setIsCopied(true);
        toast({
          title: 'Gekopieerd',
          description: 'HTML code is naar het klembord gekopieerd',
        });
        setTimeout(() => setIsCopied(false), 2000);
      }}
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Gekopieerd
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Kopieer
        </>
      )}
    </Button>
  )}
</CardHeader>
```

## Samenvatting

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/EmailSignature.tsx` | Kopieerknop toevoegen aan Preview CardHeader |

## Resultaat
Gebruikers kunnen de HTML code kopiëren vanuit zowel de Preview sectie als de HTML Code sectie, voor extra gebruiksgemak.

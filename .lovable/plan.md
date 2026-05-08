
# Plan: HTML Preview Toevoegen boven HTML Code

## Overzicht

De rechterkolom op de Email Handtekening pagina wordt aangepast met twee secties:
1. **HTML Preview (nieuw)** - Een live preview die de gegenereerde HTML rendert
2. **HTML Code (bestaand)** - De ruwe HTML code om te kopiëren

---

## Huidige Situatie

De rechterkolom toont momenteel alleen een Card met de HTML code:

```
+------------------------------------------+
| HTML Code                                |
| Kopieer deze code naar je email programma|
|------------------------------------------|
| <pre>...HTML code...</pre>               |
+------------------------------------------+
```

---

## Gewenste Situatie

```
+------------------------------------------+
| Preview                                  |
|------------------------------------------|
| [Live rendered HTML signature]           |
|                                          |
+------------------------------------------+

+------------------------------------------+
| HTML Code                    [Kopieer]   |
| Kopieer deze code naar je email programma|
|------------------------------------------|
| <pre>...HTML code...</pre>               |
+------------------------------------------+
```

---

## Code Wijzigingen

**Bestand: `src/pages/EmailSignature.tsx`**

### 1. HTML Preview Card toevoegen

Boven de bestaande HTML Code card komt een nieuwe Card met een `dangerouslySetInnerHTML` div die de gegenereerde HTML rendert:

```tsx
{/* HTML Preview */}
<Card className="bg-white/5 border-white/10">
  <CardHeader>
    <CardTitle className="text-white text-lg">Preview</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="bg-white rounded-lg p-4 min-h-[200px]">
      {isGenerating ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Preview laden...</span>
        </div>
      ) : generatedHtml ? (
        <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
      ) : (
        <span className="text-gray-400">
          Genereer een handtekening om de preview te zien.
        </span>
      )}
    </div>
  </CardContent>
</Card>
```

### 2. HTML Code Card aanpassen

De bestaande HTML Code card blijft grotendeels hetzelfde, maar met aangepaste hoogte:

- `min-h-[300px]` wordt `min-h-[200px]`
- `max-h-[500px]` wordt `max-h-[300px]`

---

## Layout Structuur

De rechterkolom krijgt een flex layout met twee cards:

```tsx
<div className="order-3 flex flex-col gap-4">
  {/* Preview Card - bovenaan */}
  <Card>...</Card>
  
  {/* HTML Code Card - onderaan */}
  <Card>...</Card>
</div>
```

---

## Technische Details

| Aspect | Implementatie |
|--------|---------------|
| HTML Rendering | `dangerouslySetInnerHTML` met de `generatedHtml` state |
| Achtergrond preview | Witte achtergrond (`bg-white`) voor realistische weergave |
| Loading state | Dezelfde `isGenerating` state wordt hergebruikt |
| Styling | Preview krijgt `overflow-auto` voor grote handtekeningen |

---

## Resultaat

- Gebruikers zien direct een visuele preview van hun email handtekening
- De HTML code blijft beschikbaar om te kopiëren
- Beide secties tonen een loading state tijdens het genereren

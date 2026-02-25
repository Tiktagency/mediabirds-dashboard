

## Probleem

De `ref` callback wordt bij **elke re-render** opnieuw uitgevoerd (omdat het een inline functie is). Dat betekent dat wanneer je typt en React opnieuw rendert, de cursor telkens weer naar het einde springt.

## Oplossing

Vervang `setSelectionRange` in de `ref` callback door een `onFocus` event handler. `onFocus` wordt alleen getriggerd wanneer het veld daadwerkelijk focus krijgt — niet bij elke re-render. De `ref` callback blijft bestaan waar nodig voor auto-resize logica bij textareas, maar zonder cursor-positionering.

### Technisch detail

```tsx
// In plaats van ref met setSelectionRange:
onFocus={(e) => {
  const len = e.currentTarget.value.length;
  e.currentTarget.setSelectionRange(len, len);
}}
```

### Bestanden en aanpassingen

| Bestand | Aanpassing |
|---|---|
| `src/components/seo-blog/BlogGenerationForm.tsx` | Textarea (regel 395-402): verwijder `setSelectionRange` uit ref, voeg `onFocus` toe. Input (regel 431-436): verwijder ref, voeg `onFocus` toe. |
| `src/components/seo-blog/KeywordResearchForm.tsx` | Input (regel 294-300): verwijder ref, voeg `onFocus` toe. Textarea (regel 435-438): verwijder `setSelectionRange` uit ref, voeg `onFocus` toe. |
| `src/components/seo-blog/PageUrlForm.tsx` | Input (regel 149-155): verwijder ref, voeg `onFocus` toe. |
| `src/pages/Landingspagina.tsx` | Textarea (regel 141-144): verwijder `setSelectionRange` uit ref, voeg `onFocus` toe. Input app_password (regel 261-267): verwijder ref, voeg `onFocus` toe. |
| `src/pages/WordpressAltText.tsx` | Input (regel 110-116): verwijder ref, voeg `onFocus` toe. Input app_password (regel 228-234): verwijder ref, voeg `onFocus` toe. |
| `src/pages/SeoBlog.tsx` | Textarea notes (regel 376-382): verwijder ref, voeg `onFocus` toe. |

Totaal: dezelfde ~10 elementen over 6 bestanden. De `ref` callbacks die alleen cursor-logica bevatten worden volledig vervangen door `onFocus`. Bij textareas met auto-resize blijft de `ref` bestaan maar zonder de `setSelectionRange` regels.


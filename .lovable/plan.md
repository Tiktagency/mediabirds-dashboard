

## Cursor aan het einde van tekst plaatsen bij het bewerken van velden

### Probleem
Wanneer je een veld selecteert om te bewerken, wordt de cursor aan het begin van de tekst geplaatst in plaats van aan het einde. Dit is onhandig omdat je meestal achteraan wilt verder typen of de tekst wilt aanpassen.

### Oplossing
Bij elk `Input` en `Textarea` veld met `autoFocus` een `ref`-callback toevoegen die de cursor naar het einde van de tekst verplaatst via `el.setSelectionRange(len, len)`. Bij Textarea-velden die al een `ref` hebben, wordt de cursor-logica toegevoegd aan de bestaande ref.

### Bestanden die worden aangepast

| Bestand | Aanpassing |
|---|---|
| `src/components/seo-blog/BlogGenerationForm.tsx` | Textarea ref (regel 395): cursor-naar-einde toevoegen. Input (regel 423): ref toevoegen met cursor-naar-einde. |
| `src/pages/Landingspagina.tsx` | Textarea ref (regel 140): cursor-naar-einde toevoegen. Input app_password (regel 261): ref toevoegen. |
| `src/components/seo-blog/KeywordResearchForm.tsx` | Input (regel 291): ref toevoegen. Textarea (regel 421): cursor-naar-einde toevoegen aan bestaande ref. |
| `src/components/seo-blog/PageUrlForm.tsx` | Input (regel 143): ref toevoegen. |
| `src/pages/WordpressAltText.tsx` | Input (regel 106): ref toevoegen. Input app_password (regel 222): ref toevoegen. |
| `src/pages/SeoBlog.tsx` | Textarea notes (regel 378): ref toevoegen. |

### Technisch detail

De cursor-positionering werkt via een `ref` callback:

```tsx
// Voor Input velden:
<Input
  autoFocus
  ref={(el) => {
    if (el) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }}
/>

// Voor Textarea velden die al een ref hebben (auto-resize):
ref={(el) => {
  if (el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }
}}
```

Totaal worden circa 10 input/textarea elementen aangepast over 6 bestanden.


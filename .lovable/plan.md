
# Plan: Auto-save bij Genereren en Forceer Selectie op Alle Elementen

## Probleem 1: Gegevens worden niet opgeslagen bij genereren

Huidige situatie in `EmailSignature.tsx`:
```tsx
onHtmlGenerated={(html) => {
  setGeneratedHtml(html);
  if (selectedSignature) {  // ← Dit is null bij nieuwe handtekening!
    saveSettings({...selectedSignature, generated_html: html}, { silent: true });
  }
}}
```

Bij een nieuwe handtekening worden de formuliergegevens niet opgeslagen.

**Oplossing**: De save-actie moet in `EmailSignatureForm.tsx` gebeuren, direct na succesvolle webhook response. Dan zijn alle formuliergegevens beschikbaar.

## Probleem 2: Oranje vlak niet selecteerbaar

De huidige CSS override werkt niet volledig omdat:
- Gegenereerde HTML kan inline styles hebben met `!important`
- CSS in `<style>` block komt vóór de HTML elementen

**Oplossing**: Pas JavaScript toe om na het renderen alle inline styles te verwijderen/overschrijven.

---

## Wijzigingen

### 1. EmailSignatureForm.tsx - Auto-save na genereren

**Regels 251-371 (onSubmit functie)**: Na succesvolle HTML generatie, sla alle gegevens automatisch op

```tsx
// Na regel 353 (na onHtmlGenerated)
// Sla alle gegevens inclusief HTML op
signatureData.generated_html = htmlCode;
await onSave(signatureData, { silent: true });
```

### 2. EmailSignature.tsx - Verwijder dubbele save logica

**Regels 102-110**: Vereenvoudig de callback omdat save nu in het formulier gebeurt

```tsx
onHtmlGenerated={(html) => {
  setGeneratedHtml(html);
}}
```

### 3. EmailSignature.tsx - Forceer selectie via JavaScript

**Regels 131-149**: Gebruik `useEffect` met `ref` om inline styles te overschrijven na render

```tsx
// Nieuwe ref en useEffect toevoegen
const previewRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (previewRef.current && generatedHtml) {
    // Forceer selecteerbaarheid op ALLE elementen
    const allElements = previewRef.current.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.setProperty('user-select', 'text', 'important');
      htmlEl.style.setProperty('-webkit-user-select', 'text', 'important');
      htmlEl.style.setProperty('cursor', 'text', 'important');
      htmlEl.style.setProperty('pointer-events', 'auto', 'important');
    });
  }
}, [generatedHtml]);
```

---

## Technische Details

| Bestand | Wijziging |
|---------|-----------|
| `EmailSignatureForm.tsx` | Save alle data + HTML na succesvolle generatie |
| `EmailSignature.tsx` | Verwijder dubbele save, voeg JS-based style override toe |

## Resultaat

1. Bij "Handtekening genereren" worden automatisch alle formuliergegevens + HTML opgeslagen
2. ALLE elementen in de preview (inclusief oranje vlakken) zijn selecteerbaar via JavaScript DOM manipulatie

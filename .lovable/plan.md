
# Auto-save bij bewerken: vinkje en kruisje verwijderen

## Wat verandert er

Alle bewerkingsvelden slaan automatisch op wanneer je ergens anders klikt (onBlur). De Check- en XCircle-iconen worden verwijderd. Dit geldt voor drie plekken:

1. **Notities vak** (`SeoBlog.tsx`) -- textarea slaat automatisch op bij onBlur
2. **Input velden** (`KeywordResearchForm.tsx` -- `renderInputField`) -- input slaat op bij onBlur
3. **Tekstvelden** (`KeywordResearchForm.tsx` -- `renderTextField`) -- textarea slaat op bij onBlur

## Hoe het werkt

- Wanneer je op een veld klikt om te bewerken, verschijnt het invoerveld (zoals nu)
- Er zijn **geen** vinkje/kruisje knoppen meer
- Zodra je buiten het veld klikt (onBlur), wordt de waarde automatisch opgeslagen
- Ook lege velden worden opgeslagen (waarde wordt `null` in de database)
- Na opslaan keert het veld terug naar de weergavemodus

## Technische wijzigingen

### 1. `src/pages/SeoBlog.tsx` (Notities)
- Verwijder de Check en XCircle knoppen uit het editing-blok (regels 377-406)
- Voeg `onBlur` toe aan de Textarea die `handleSaveNotes` aanroept en terugschakelt naar 'expanded'
- Vereenvoudig de editing-state: geen knoppen meer, alleen de textarea

### 2. `src/components/seo-blog/KeywordResearchForm.tsx` (renderInputField)
- Verwijder Check en XCircle knoppen (regels 282-297)
- Voeg `onBlur` toe aan de Input die `handleSaveField(field)` aanroept
- Het veld gaat terug naar weergavemodus na opslaan

### 3. `src/components/seo-blog/KeywordResearchForm.tsx` (renderTextField)
- Verwijder Check en XCircle knoppen (regels 415-430)
- Voeg `onBlur` toe aan de Textarea die `handleSaveField(field)` aanroept
- Het veld gaat terug naar weergavemodus na opslaan

### 4. Opruimen
- `handleCancelEdit` functie kan verwijderd worden (niet meer nodig)
- Check en XCircle imports verwijderen als ze nergens anders meer gebruikt worden in KeywordResearchForm

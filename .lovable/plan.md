

# Auto-save op blur voor alle velden in Blog Generatie

## Wat verandert er

De Blog Generatie formulier gebruikt momenteel handmatige opslag- en annuleerknoppen (vinkje/kruisje) bij het bewerken van velden. Dit wordt vervangen door hetzelfde auto-save-op-blur patroon dat al werkt in het Zoekwoord Onderzoek formulier: klik op een veld om te bewerken, klik ergens anders om automatisch op te slaan.

## Huidige situatie

- **Zoekwoord Onderzoek**: Klik op veld -> bewerk -> verlaat veld (blur) -> automatisch opgeslagen. Geen vinkje/kruisje knoppen.
- **Blog Generatie**: Klik op veld -> expand -> klik potlood -> bewerk -> klik vinkje om op te slaan OF kruisje om te annuleren.
- **Pagina URL**: Gebruikt al auto-save op blur.

## Technisch

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**

Aanpassingen in de `renderField` functie (regels 340-487):

1. **Verwijder de Check en XCircle import** (niet meer nodig)
2. **Verwijder de `handleCancelEdit` functie** (niet meer nodig)
3. **Wijzig de editing-state**: In plaats van save/cancel knoppen, gebruik `onBlur` op het Input/Textarea element om `handleSaveField` aan te roepen, met `autoFocus`
4. **Verwijder de expanded-state tussenstap voor tekstvelden**: Klik direct op het veld om te bewerken (geen expand -> potlood stap meer), consistent met hoe `renderInputField` werkt in KeywordResearchForm
5. **Select velden**: Blijven ongewijzigd -- deze slaan al direct op bij waardeverandering

De drie states worden vereenvoudigd:
- Niet-bewerken: Toont waarde in een klikbaar vak
- Bewerken: Input/Textarea met autoFocus, opslaan bij blur

De `expandedField` state en click-outside handler kunnen verwijderd worden uit BlogGenerationForm, aangezien de expand-stap niet meer nodig is.


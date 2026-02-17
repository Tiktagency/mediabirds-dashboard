

# Auto-save op blur voor alle velden in Blog Generatie

## Wat verandert er

Alle invulvelden in het Blog Generatie formulier gaan hetzelfde werken als in Zoekwoord Onderzoek: klik op een veld om te bewerken, klik ergens anders (blur) om automatisch op te slaan. De tussenstap (uitklappen + potlood-icoon) en de handmatige opslag-/annuleerknoppen (vinkje/kruisje) verdwijnen.

## Huidige situatie

- **Zoekwoord Onderzoek**: Klik op veld -> bewerk -> verlaat veld -> automatisch opgeslagen
- **Blog Generatie**: Klik op veld -> klapt uit -> klik potlood -> bewerk -> klik vinkje/kruisje
- **Select velden**: Slaan al direct op bij waardeverandering (blijft ongewijzigd)

## Technisch

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**

1. **Imports opschonen**: `Check` en `XCircle` verwijderen uit de lucide-react import (regel 9)
2. **State opschonen**: `expandedField` state verwijderen (regel 43)
3. **Click-outside handler verwijderen**: Het hele `useEffect` blok voor expandedField (regels 63-72)
4. **`handleCancelEdit` functie verwijderen** (regels 229-252)
5. **`renderField` functie vereenvoudigen** (regels 340-487):
   - Editing mode: `onBlur={() => handleSaveField(field)}` en `autoFocus` toevoegen aan Input en Textarea
   - Save/cancel knoppen (Check/XCircle) verwijderen
   - Expanded state (de tussenstap met potlood-icoon) volledig verwijderen
   - Collapsed state: `onClick` wijzigen van `setExpandedField(field)` naar `setEditingField(field)` zodat klikken direct de bewerkingsmodus opent
   - Select velden blijven ongewijzigd (slaan al direct op)

De vereenvoudigde flow wordt:
- **Niet-bewerken**: Waarde in een klikbaar vak
- **Bewerken**: Input/Textarea met autoFocus, automatisch opslaan bij blur

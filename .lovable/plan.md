

## "Opgeslagen" melding alleen tonen bij daadwerkelijke wijzigingen

### Probleem
Wanneer je op een veld klikt om te bekijken wat erin staat en vervolgens wegklikt zonder iets te wijzigen, verschijnt er onterecht een "Opgeslagen" melding. Dit gebeurt in alle drie de formulieren: Pagina URL, Blog Generatie en Zoekwoord Onderzoek.

### Oplossing
Bij het verlaten van een veld (blur) wordt eerst gecontroleerd of de waarde daadwerkelijk is gewijzigd ten opzichte van de oorspronkelijk geladen waarde. Alleen als er een verschil is, wordt opgeslagen en de melding getoond. Als er niets is gewijzigd, wordt het veld gewoon gesloten zonder actie.

### Aanpassingen per bestand

**1. `src/components/seo-blog/PageUrlForm.tsx`**
- De `autoSave` functie wordt alleen aangeroepen als er een echte wijziging is. De bestaande checks in `handleSpreadsheetIdBlur` en `handleGridIdBlur` werken al correct. Geen wijziging nodig daar.
- Controleer of `handleUrlBlur` niet onnodig triggert (JSON vergelijking is al aanwezig).

**2. `src/components/seo-blog/BlogGenerationForm.tsx`**
- In `handleSaveField`: voor het opslaan, vergelijk de huidige `formData[field]` waarde met de oorspronkelijk geladen waarde uit `settings`. Als ze gelijk zijn, alleen `setEditingField(null)` aanroepen en direct returnen zonder op te slaan of een toast te tonen.

**3. `src/components/seo-blog/KeywordResearchForm.tsx`**
- Zelfde aanpak als BlogGenerationForm: in `handleSaveField` de huidige waarde vergelijken met de oorspronkelijk geladen waarde uit `settings`. Bij geen verschil, alleen het bewerkingsveld sluiten.

### Technische details

Per formulier wordt een vergelijking toegevoegd aan het begin van `handleSaveField`:

```text
BlogGenerationForm / KeywordResearchForm:
  handleSaveField(field):
    huidige_waarde = formData[field]
    originele_waarde = settings?.[field] || ''
    
    als huidige_waarde === originele_waarde:
      setEditingField(null)
      return  // geen save, geen toast
    
    // ... bestaande save-logica
```

Voor PageUrlForm is de logica al grotendeels correct via de bestaande vergelijkingen in de blur handlers. Alleen het `renderInputField` `onBlur` moet correct doorvallen naar de specifieke handler die de check uitvoert, en `setEditingField(null)` moet altijd worden aangeroepen (ook zonder save).

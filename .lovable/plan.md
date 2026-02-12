
# Admin instellingen altijd open: Collapsible verwijderen

## Wat verandert er

De "Admin instellingen" secties in alle drie de formulieren staan altijd open. De in-/uitklapfunctie (Collapsible) en het ChevronDown-icoon worden verwijderd.

## Wijzigingen

### 1. `src/components/seo-blog/PageUrlForm.tsx`
- Verwijder de `Collapsible`, `CollapsibleTrigger` en `CollapsibleContent` wrapper (regels 285-321)
- Vervang door een gewone `div` met de titel "Admin instellingen" en de inhoud eronder
- Verwijder de `adminSettingsOpen` state
- Verwijder `Collapsible`-imports en `ChevronDown` als die niet elders gebruikt worden
- Verwijder `cn` import als die niet elders gebruikt wordt

### 2. `src/components/seo-blog/KeywordResearchForm.tsx`
- Verwijder de `Collapsible`, `CollapsibleTrigger` en `CollapsibleContent` wrapper (regels 483-521)
- Vervang door een gewone `div` met de titel en inhoud
- Verwijder de `adminSettingsOpen` state
- Verwijder ongebruikte imports (`Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `ChevronDown`, `cn`)

### 3. `src/components/seo-blog/BlogGenerationForm.tsx`
- Verwijder de `Collapsible`, `CollapsibleTrigger` en `CollapsibleContent` wrapper (regels 690-713)
- Vervang door een gewone `div` met de titel en inhoud
- Verwijder de `adminSettingsOpen` state
- Verwijder ongebruikte imports

### Structuur na wijziging (per formulier)

```
{isAdmin && (
  <div className="pt-6 border-t border-white/10 space-y-4">
    <p className="text-sm text-yellow-400/80 font-medium">Admin instellingen</p>
    {/* bestaande velden */}
  </div>
)}
```

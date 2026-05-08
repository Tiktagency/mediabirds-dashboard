

## Potlood-icoon toevoegen aan alle click-to-edit velden

### Probleem
In de formulieren **Blog Generatie** en **Zoekwoord Onderzoek** ontbreekt het potlood-icoon bij velden in de niet-bewerkingsmodus. Het icoon is wel aanwezig in het **Pagina URL** formulier (via `renderInputField`). Hierdoor is het voor gebruikers niet duidelijk dat ze op een veld kunnen klikken om het te bewerken.

### Aanpassingen

**1. `src/components/seo-blog/BlogGenerationForm.tsx`**
- `Pencil` toevoegen aan de lucide-react import (ontbreekt momenteel volledig)
- In de `renderField` functie (regel 438-447): het potlood-icoon toevoegen aan de statische `<div>` weergave, rechts uitgelijnd met `flex items-center justify-between`
- Dit geldt voor alle tekst- en textarea-velden (niet voor select-velden, die hebben al een dropdown-indicator)

**2. `src/components/seo-blog/KeywordResearchForm.tsx`**
- In de `renderField` functie (regels 304-309 en 316-321): het potlood-icoon toevoegen aan de statische weergave van reguliere velden (niet-Google ID velden)
- Voor Google ID velden met waarde hebben al aparte iconen (kopieer/bewerk/verwijder), daar hoeft niets te veranderen
- Voor reguliere velden en lege Google ID velden: potlood-icoon toevoegen

### Technische details

De wijziging is steeds hetzelfde patroon - de statische `<div>` krijgt `flex items-center justify-between` en een `<Pencil>` icoon:

```text
BlogGenerationForm - renderField (niet-select velden):
  <div className="... flex items-center justify-between ...">
    <span className="truncate">{value || placeholder}</span>
    <Pencil className="h-3.5 w-3.5 text-white/40 shrink-0 ml-2" />
  </div>

KeywordResearchForm - renderField (reguliere velden):
  Zelfde aanpak voor de div op regel 316-321
  Google ID velden met waarde (regel 304-309) behouden hun bestaande iconen
```

De styling van het potlood-icoon (`h-3.5 w-3.5 text-white/40 shrink-0 ml-2`) is consistent met het `PageUrlForm` patroon.

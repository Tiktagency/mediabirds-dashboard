
# Kleur-picker toevoegen aan AI afbeelding kleurvelden

## Wat verandert er

De gekleurde vierkantjes naast de kleurvelden (Achtergrond kleur, Kleur 1, Kleur 2) worden klikbaar. Bij klikken opent een native color picker (`<input type="color">`) waarmee je visueel een kleur kunt kiezen. De hex-code in het tekstveld wordt automatisch bijgewerkt en opgeslagen.

## Technisch

**Bestand: `src/components/seo-blog/BlogGenerationForm.tsx`**

Voor elk van de drie kleurvelden (regels 557-586) wordt het statische `<div>` kleurblokje vervangen door een `<label>` met een verborgen `<input type="color">` erin:

```
<label className="w-10 h-10 rounded-md border border-white/20 shrink-0 cursor-pointer relative overflow-hidden">
  <div className="w-full h-full" style={{ backgroundColor: formData.achtergrond_kleur || 'transparent' }} />
  <input
    type="color"
    value={formData.achtergrond_kleur || '#000000'}
    onChange={(e) => {
      setFormData(prev => ({ ...prev, achtergrond_kleur: e.target.value }));
    }}
    onBlur={() => handleSaveField('achtergrond_kleur')}
    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
  />
</label>
```

Dit wordt toegepast op alle drie de kleurvelden:
- `achtergrond_kleur` (regel 561-564)
- `hoofdaccent_gradient_1` (regel 573-576)
- `hoofdaccent_gradient_2` (regel 582-585)

De kleur wordt direct in het formulier bijgewerkt bij selectie en opgeslagen bij blur, consistent met het auto-save patroon.

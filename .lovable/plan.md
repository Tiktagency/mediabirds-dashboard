## Plan: Stijl verplicht bij AI-afbeelding

### Probleem
In `BlogGenerationForm.tsx` controleert `isFormComplete()` bij `image_type === 'ai_image'` wel op achtergrondkleur en gradient, maar niet op `image_style`. Hierdoor kan de "Genereer blog"-knop actief worden zonder dat er een stijl gekozen is.

### Wijziging
In `src/components/seo-blog/BlogGenerationForm.tsx` rond regel 191-194 de AI-image-validatie uitbreiden zodat ook `image_style` aanwezig moet zijn:

```ts
if (formData.image_type === 'ai_image') {
  if (
    !formData.achtergrond_kleur ||
    !formData.hoofdaccent_gradient_1 ||
    !formData.hoofdaccent_gradient_2 ||
    !formData.image_style
  ) {
    return false;
  }
}
```

### Effect
- Knop blijft `disabled` zolang er bij AI-afbeelding nog geen stijl (isometric / cinematic / brutalist) is geselecteerd.
- Bij Google Drive verandert er niets.
- Geen database- of edge-functionwijzigingen nodig.

### Bestanden
| Bestand | Wijziging |
|---------|-----------|
| `src/components/seo-blog/BlogGenerationForm.tsx` | `image_style` toevoegen aan verplichte velden in `isFormComplete()` |

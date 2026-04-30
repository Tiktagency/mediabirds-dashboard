## Plan: `image_style` meesturen bij geplande blog-runs

### Probleem
In `supabase/functions/run-scheduled-blogs/index.ts` wordt het volledige formulier al meegestuurd, maar het nieuwe veld `image_style` ontbreekt. Bij handmatige runs wordt het wel meegestuurd.

### Wijziging
In `run-scheduled-blogs/index.ts` in het `blogPayload` object (rond regel 127-153) één regel toevoegen, consistent met het patroon van `achtergrond_kleur` / `hoofdaccent_gradient` (alleen versturen bij AI-image, anders leeg):

```ts
image_style: imageType !== 'google_drive' ? (blogSettings.image_style || '') : '',
```

### Bestanden
| Bestand | Wijziging |
|---------|-----------|
| `supabase/functions/run-scheduled-blogs/index.ts` | `image_style` toevoegen aan `blogPayload` |

Geen database- of frontend-wijzigingen nodig — het veld staat al in `blog_settings` en wordt bij wijziging automatisch opgeslagen.
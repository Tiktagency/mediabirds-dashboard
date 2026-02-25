

## Ontbrekend "Extra instructie" veld toevoegen aan render

### Probleem

Het `extra_instructie` veld is correct toegevoegd aan de state, het laden van settings, en de webhook payload, maar de `renderField` aanroep om het daadwerkelijk te tonen ontbreekt in de JSX.

### Oplossing

In `src/components/seo-blog/BlogGenerationForm.tsx` wordt na regel 588 (het Taal veld) een `renderField` aanroep toegevoegd:

```tsx
{renderField('Extra instructie', 'extra_instructie', 'textarea')}
```

Dit wordt geplaatst direct na het Taal-veld en voor de Afbeelding-sectie. Het veld gebruikt het bestaande drie-stappen klik-patroon via `renderField` met type `textarea`.

### Wijziging

| Bestand | Aanpassing |
|---|---|
| `src/components/seo-blog/BlogGenerationForm.tsx` | Na regel 588 (`renderField('Taal', ...)`) de renderField aanroep voor `extra_instructie` toevoegen |


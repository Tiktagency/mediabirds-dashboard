

## Wachtwoord lengte behouden bij weergave

### Probleem
Wanneer je het wachtwoord-veld verlaat, wordt het altijd weergegeven als 12 vaste dots (`••••••••••••`), ongeacht de werkelijke lengte van het wachtwoord. Dit geeft een verwarrende "krimpende" indruk.

### Oplossing
In `src/pages/WordpressAltText.tsx` (regel 211) de vaste string `'••••••••••••'` vervangen door een dynamische string die evenveel dots toont als het wachtwoord karakters heeft:

```typescript
// Van:
{editPassword ? '••••••••••••' : 'abcd efgh ijkl 1234'}

// Naar:
{editPassword ? '•'.repeat(editPassword.length) : 'abcd efgh ijkl 1234'}
```

De `truncate` class op de `<span>` zorgt er al voor dat als het wachtwoord langer is dan het veld, het netjes wordt afgeknipt met ellipsis.


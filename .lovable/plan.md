

## Afbeelding vierkant maken in animatiepaneel

### Aanpassing

**Bestand: `src/components/wordpress-alt-text/AltTextAnimation.tsx`**

De afbeelding-container wordt aangepast van `h-32` (128px hoog, rechthoekig) naar `aspect-square` zodat de afbeelding een vierkant formaat krijgt dat de volledige breedte van het paneel benut.

| Was | Wordt |
|---|---|
| `className="w-full h-32 rounded bg-gray-100 overflow-hidden mb-4"` | `className="w-full aspect-square rounded bg-gray-100 overflow-hidden mb-4"` |

De `object-cover` op de `<img>` tag zorgt ervoor dat de afbeelding mooi vullend blijft zonder vervorming.


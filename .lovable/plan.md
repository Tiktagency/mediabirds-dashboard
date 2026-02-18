

## Fix: animatie stopt niet na webhook response

### Probleem
In de `handleStart` functie in `WordpressAltText.tsx` wordt `setIsAnimating(true)` aangezet bij het starten, maar `setIsAnimating(false)` wordt nergens aangeroepen in de `finally` block. Alleen `setIsStarting(false)` staat daar. Daardoor blijft de animatie eindeloos doorlopen.

### Oplossing
In `src/pages/WordpressAltText.tsx` regel 95, `setIsAnimating(false)` toevoegen in de `finally` block:

```typescript
} finally {
  setIsStarting(false);
  setIsAnimating(false);
}
```

Dit is de enige wijziging die nodig is -- 1 regel toevoegen.

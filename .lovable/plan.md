
## Toast duur naar 3 seconden + animatie doorlopen tijdens webhook

### Probleem
1. "Opgeslagen" toasts blijven 5 seconden zichtbaar in plaats van 3 seconden
2. De animatie stopt na ~2.4 seconden (4 velden x 500ms + 400ms) terwijl de webhook mogelijk nog bezig is

### Aanpassingen

**1. `src/hooks/use-toast.ts` (regel 9)**
- `TOAST_REMOVE_DELAY` wijzigen van `5000` naar `3000`

**2. `src/pages/WordpressAltText.tsx` (regel 90)**
- `duration: 5000` verwijderen bij de success-toast (gebruikt dan de globale 3s default)

**3. `src/components/wordpress-alt-text/AltTextAnimation.tsx`**
- De animatie in een loop laten draaien zolang `isAnimating` true is: na het vullen van alle 4 velden, reset en begin opnieuw
- `onAnimationComplete` pas aanroepen wanneer `isAnimating` extern op false wordt gezet (dus wanneer de webhook response binnen is)

**Technische details:**

De animatie-loop werkt als volgt:
- Na het vullen van het laatste veld, wacht 800ms, reset alle velden, en start opnieuw
- Dit herhaalt zich totdat `isAnimating` false wordt (webhook klaar)
- Bij het stoppen van de animatie blijven de velden nog 3 seconden gevuld zichtbaar voordat ze verdwijnen

In `WordpressAltText.tsx` wordt `setIsAnimating(false)` al aangeroepen in de `finally` block van `handleStart`, dus de animatie stopt automatisch zodra de webhook response (of error) binnenkomt.

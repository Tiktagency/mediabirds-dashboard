
## Verwijder `secundaire_kleur` & `accent_kleur` uit de POST payload

De twee kleuren worden nog op drie plekken meegestuurd:

1. **`src/pages/Nieuwsbrief.tsx`** — payload die naar de edge function wordt gestuurd (regels 395 en 400)
2. **`supabase/functions/trigger-newsletter-webhook/index.ts`** — destructuring van body (regels 42-43) én de payload naar n8n (regels 60 en 65)

### Wijzigingen

**`src/pages/Nieuwsbrief.tsx`** — verwijder uit de POST body (regels 395 en 400):
- `secundaire_kleur: localColors.secundaire_kleur,`
- `accent_kleur: localColors.accent_kleur,`

**`supabase/functions/trigger-newsletter-webhook/index.ts`**:
- Regel 42-43: verwijder `secundaire_kleur` en `accent_kleur` uit de destructuring
- Regels 60 en 65: verwijder `secundaire_kleur` en `accent_kleur` uit de payload naar n8n

Geen database- of andere wijzigingen nodig.

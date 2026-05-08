
## Verwijder ongebruikte kleuren: `secundaire_kleur` & `accent_kleur`

Deze twee kleuren verschijnen in de `COLOR_FIELDS` lijst (de kleur-picker rij) maar worden nergens in de Live Kleur Preview gebruikt. Ze worden alleen verwijderd uit de UI — de velden blijven in de database en webhook payload staan (geen breaking changes).

### Wijziging in `src/pages/Nieuwsbrief.tsx`

**Regel 64** — verwijder `secundaire_kleur` uit `COLOR_FIELDS`:
```ts
{ key: 'secundaire_kleur', label: 'Secundaire kleur' },  // ← weg
```

**Regel 69** — verwijder `accent_kleur` uit `COLOR_FIELDS`:
```ts
{ key: 'accent_kleur', label: 'Accentkleur' },  // ← weg
```

Dit zijn de enige twee regels die veranderen. De rest (state, saveSettings, webhook payload) blijft intact.

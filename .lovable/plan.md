
## Probleem analyse

De huidige mapping in `extract-brand-colors` heeft twee kernproblemen:

1. **Hardcoded fallbacks met vreemde kleuren** — `secundaire_kleur` valt terug op `#1A2B5E` (willekeurig blauw) en `footer_achtergrond` gebruikt `colors.secondary || colors.primary` ook met fallback `#1A2B5E`. Als Firecrawl geen `secondary` teruggeeft, wordt dus een volledig willekeurige kleur ingevuld.

2. **Slechte mapping-logica** — De velden worden niet slim gemapt:
   - `cta_tekst_kleur` heeft een kapotte expressie: `hex(colors.textPrimary ? '#FFFFFF' : colors.textPrimary, '#FFFFFF')` — dit geeft altijd `#FFFFFF` terug, ongeacht wat Firecrawl retourneert
   - `footer_achtergrond` wordt gemapt op `secondary` maar dat klopt semantisch niet altijd
   - `footer_tekst_kleur` heeft `hex(colors.textSecondary || '#E8EDF7', '#E8EDF7')` — maar `'#E8EDF7'` is een truthy string, dus `colors.textSecondary` wordt nooit gebruikt

3. **Geen gebruik van button-component kleuren** — Firecrawl geeft ook `branding.components.buttonPrimary.background` en `buttonPrimary.textColor` terug, maar deze worden niet gebruikt. Terwijl de gebruiker expliciet aangeeft dat knoppen een andere tekstkleur hebben (wit).

### Betere mapping-strategie

Firecrawl `branding` response bevat:
- `colors.primary` → knopkleur / primaire accent
- `colors.secondary` → kan ontbreken
- `colors.background` → pagina-achtergrond
- `colors.textPrimary` → hoofdtekst
- `colors.textSecondary` → subtekst
- `colors.accent` → accentkleur
- `components.buttonPrimary.background` → knopachtergrond
- `components.buttonPrimary.textColor` → knoptekst (bijna altijd wit)
- `colorScheme` → 'light' / 'dark'

### Nieuwe mapping

| Veld | Bron (in volgorde van prioriteit) |
|---|---|
| `primaire_kleur` | `components.buttonPrimary.background` → `colors.primary` |
| `secundaire_kleur` | `colors.secondary` (alleen als beschikbaar, anders `colors.primary` donkerder of zelfde als primair) |
| `achtergrond_kleur` | `colors.background` |
| `kaart_achtergrond` | lichtere variant van `colors.background` (surface) → `colors.background` |
| `tekst_kleur` | `colors.textPrimary` |
| `subtekst_kleur` | `colors.textSecondary` → lichter dan `tekst_kleur` |
| `accent_kleur` | `colors.accent` → `colors.primary` |
| `cta_tekst_kleur` | `components.buttonPrimary.textColor` → `#FFFFFF` |
| `footer_achtergrond` | `colors.secondary` als beschikbaar, anders `colors.primary` |  
| `footer_tekst_kleur` | als `footer_achtergrond` donker → `#FFFFFF`, anders `colors.textPrimary` |

### Aanvullende verbeteringen

1. **Geen willekeurige fallbacks** — als een kleur niet beschikbaar is, gebruik een logische afleiding (bijv. `secondary` = `primary` als niet beschikbaar)
2. **Log de volledige raw branding response** zodat we kunnen debuggen wat Firecrawl exact teruggeeft
3. **Intelligente footer-tekstkleur** — bereken of de footer-achtergrond donker of licht is en kies automatisch witte of donkere tekst
4. **`secondary` fallback** — als `colors.secondary` niet bestaat, gebruik `colors.primary` (niet een hardcoded blauw)

### Bestand

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/extract-brand-colors/index.ts` | Mapping logica volledig herschrijven |

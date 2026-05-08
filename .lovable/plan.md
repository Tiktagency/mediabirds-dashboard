
## Wijziging: Footer achtergrond koppelen

Op regel 712 staat de footer-sectie. De `backgroundColor` is nu hardcoded aan `localColors.achtergrond_kleur`, maar dit moet `localColors.footer_achtergrond` zijn.

Daarnaast moet de tekst-kleur in de footer ook `localColors.footer_tekst_kleur` gebruiken in plaats van `localColors.tekst_kleur` en `localColors.subtekst_kleur`.

### Wijzigingen op regel 712-728:

| Element | Huidig | Nieuw |
|---|---|---|
| Footer `backgroundColor` | `achtergrond_kleur` | `footer_achtergrond` |
| Bedrijfsnaam kleur | `tekst_kleur` | `footer_tekst_kleur` |
| Tagline kleur | `tekst_kleur` | `footer_tekst_kleur` |
| Website link kleur | `primaire_kleur` | `primaire_kleur` (behouden) |
| Divider kleur | `subtekst_kleur` | `footer_tekst_kleur` |
| Afmelden tekst | `subtekst_kleur` | `footer_tekst_kleur` |
| Copyright tekst | `subtekst_kleur` | `footer_tekst_kleur` |

**Bestand:** `src/pages/Nieuwsbrief.tsx` — regels 712–729

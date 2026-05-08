
## Plan: Gegevens opslaan per bedrijf (zoals alt-tekst pagina)

### Probleem
De Nieuwsbrief pagina heeft momenteel een dubbele dataflow:
- Als er een bedrijf geselecteerd is → data uit `newsletter_companies`
- Als er **geen** bedrijf geselecteerd is → fallback naar `newsletter_settings` (per gebruiker)

De alt-tekst pagina werkt uitsluitend per bedrijf: als er geen bedrijf geselecteerd is, zie je gewoon "Selecteer een bedrijf". Er is geen fallback.

### Oplossing

Alle `newsletter_settings` / `useNewsletterSettings` logica uit `Nieuwsbrief.tsx` verwijderen en vervangen door uitsluitend `newsletter_companies`-gebaseerde opslag.

**Concreet:**
1. `useNewsletterSettings` hook + `settings` state **verwijderen** uit de pagina
2. De `isLoading || !settings` loading-gate **verwijderen** — er is geen hook meer die blokkeert
3. Alle `else if (settings) { saveSettings(...) }` fallbacks in handlers **verwijderen**
4. `handleGenerate` aanpassen: `settingsId` instellen als `selectedCompany?.id` (geen `settings.id` meer)
5. Als `!selectedCompany`: toon "Selecteer een bedrijf om te beginnen" — identiek aan alt-tekst pagina
6. `useEffect` voor het laden van data vereenvoudigen: alleen nog op `selectedCompany` reageren

### Bestand

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | `useNewsletterSettings` verwijderen, alle handlers zuiveren van `settings` fallback, "geen bedrijf" state toevoegen |

De `useNewsletterSettings` hook en de `newsletter_settings` tabel blijven bestaan maar worden niet meer gebruikt door deze pagina.

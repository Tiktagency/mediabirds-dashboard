

## Toevoeg-dialoog Landingspagina gelijktrekken met SEO-pagina

### Wat verandert er

Het "Bedrijf toevoegen"-dialoog op de Landingspagina wordt vereenvoudigd zodat het identiek werkt aan dat van de `/seo-blog` pagina: alleen **Bedrijfsnaam** en **Website domeinnaam** als invoervelden. De overige velden (applicatie wachtwoord, spreadsheet ID, grid ID) worden niet meer in het dialoog getoond -- die kunnen later op de pagina zelf worden ingevuld.

De auto-fill vanuit `alt_text_companies` (domeinnaam + applicatie wachtwoord) blijft behouden op basis van de bedrijfsnaam.

### Aanpassingen in `src/components/landing/LandingCompanySelector.tsx`

1. **Dialoogvelden verwijderen**: de invoervelden voor applicatie wachtwoord, spreadsheet ID en grid ID worden verwijderd uit het dialoog
2. **State opschonen**: `newCompanyPassword`, `newSpreadsheetId`, `newGridId` worden niet meer gebruikt in het dialoog (maar nog wel gereset bij confirm)
3. **Auto-fill aanpassen**: bij name blur wordt nu ook het domeinnaam-veld ingevuld vanuit `alt_text_companies`, en het `app_password` wordt meegestuurd bij insert maar niet getoond
4. **Bevestigingsdialoog**: tekst wordt gelijkgetrokken met de SEO-versie ("bijbehorende documenten" hint verwijderd, alleen naam + domein getoond)
5. **Insert aanpassen**: bij het aanmaken wordt `domain` + eventueel gevonden `app_password` direct meegestuurd, maar zonder spreadsheet/grid velden

### Technische details

**Dialoog wordt vereenvoudigd naar:**
```
- Bedrijfsnaam (verplicht, met auto-fill op blur)
- Website domeinnaam (optioneel)
```

**handleNameBlur blijft**: zoekt in `alt_text_companies` en vult `domain` en `app_password` in (app_password wordt intern opgeslagen maar niet als veld getoond).

**handleConfirmAdd insert:**
```typescript
.insert({
  name: newCompanyName.trim(),
  domain: newCompanyDomain.trim() || null,
  app_password: newCompanyPassword.trim() || null, // auto-filled, not shown
})
```

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/landing/LandingCompanySelector.tsx` | Dialoogvelden reduceren tot naam + domein, zoals SEO CompanySelector |


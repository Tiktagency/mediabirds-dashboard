

## Geselecteerd bedrijf weergeven op de Alt-Tekst pagina

### Wat er verandert
Wanneer een bedrijf is geselecteerd in de dropdown, worden de gegevens (bedrijfsnaam en domeinnaam) zichtbaar op de pagina onder de titel.

### Aanpassingen

**1. `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`**
- Voeg een `onSelect` callback prop toe: `onSelect?: (company: AltTextCompany | null) => void`
- Roep `onSelect` aan wanneer een bedrijf wordt geselecteerd (bij initieel laden en bij klikken)
- Exporteer het `AltTextCompany` type zodat de pagina het kan gebruiken

**2. `src/pages/WordpressAltText.tsx`**
- Voeg state toe: `const [selectedCompany, setSelectedCompany] = useState<AltTextCompany | null>(null)`
- Geef `onSelect={setSelectedCompany}` mee aan `AltTextCompanySelector`
- Toon onder de titel een informatieblok met:
  - Bedrijfsnaam (groot/duidelijk)
  - Domeinnaam (als link of subtekst)
- Gebruik een `Card` met `bg-white/10 backdrop-blur-sm border-white/20` styling (passend bij de huisstijl)
- Als er nog geen bedrijf is geselecteerd, toon een subtiele melding ("Selecteer een bedrijf om de gegevens te zien")

### Weergave

```
+----------------------------------+
|  Dashboard          [Dropdown]   |
+----------------------------------+
|                                  |
|      Alt-tekst wordpress         |
|                                  |
|   +------------------------+     |
|   | Bedrijfsnaam: Reneko   |     |
|   | Domein: reneko.nl      |     |
|   +------------------------+     |
|                                  |
+----------------------------------+
```


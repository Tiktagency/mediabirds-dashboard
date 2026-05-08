

# Handleiding stap 4 splitsen en stap 6 aanpassen

## Wijzigingen

### Stap 4 splitsen in twee stappen
De huidige stap 4 (Sitemaps toevoegen) bevat te veel informatie. Deze wordt opgesplitst:

**Stap 4: Sitemaps toevoegen**
> Ga naar de website van de klant en surf naar [domeinnaam]/sitemap.xml. Identificeer de relevante sitemaps (bijv. de page-sitemap of post-sitemap).

**Stap 5: URL's documenteren**
> Kopieer de relevante URL's en plak deze in het dashboard onder Pagina URLs. Gebruik de knop "URL toevoegen" voor extra velden. Druk tot slot op de knop URL's documenteren.

### Stap 6 tekst aanpassen (wordt stap 7 na split)
Nieuwe tekst:
> Admin Instellingen configureren
>
> Open het bestand [BEDRIJFSNAAM] seo in Google Drive, navigeer naar het tweede tab "Zoekwoord nieuw"
>
> Zoekwoord nieuw: Haal de Grid ID op uit de browser URL en vul in.

### Hernummering
Door de split van stap 4 komen er nu 13 stappen:

| Nieuw | Was | Titel |
|-------|-----|-------|
| 1 | 1 | Toegang regelen |
| 2 | 2 | URL Database updaten |
| 3 | 3 | Koppelen met Google Sheets |
| 4 | 4 (deel 1) | Sitemaps toevoegen |
| 5 | 4 (deel 2) | URL's documenteren |
| 6 | 5 | Bedrijfskennis invullen |
| 7 | 6 | Admin Instellingen configureren |
| 8 | 7 | Testen |
| 9 | 8 | Basisinstellingen |
| 10 | 9 | Beeldmateriaal kiezen |
| 11 | 10 | Publicatie status |
| 12 | 11 | Categorieen (Optioneel) |
| 13 | 12 | Finalisering |

De deel-grenzen verschuiven:
- Deel 2: stappen 3-5 (was 3-4)
- Deel 3: stappen 6-8 (was 5-7)
- Deel 4: stappen 9-13 (was 8-12)

## Technisch

Alleen `src/pages/SeoBlog.tsx` wordt aangepast (regels 685-732).


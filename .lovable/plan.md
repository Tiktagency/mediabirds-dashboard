
# Handleiding aanpassen: stappen verwijderen en wijzigen

## Overzicht

De SEO blog handleiding in `src/pages/SeoBlog.tsx` wordt aangepast:

- **Verwijderen**: Stap 3 (Bedrijfsdocument aanmaken), Stap 4 (Klantmap organiseren), Stap 5 (Bedrijf selecteren), Stap 14 (Spreadsheet koppeling herhalen), Stap 15 (API Koppelingen)
- **Wijzigen**: Stap 6 en Stap 9 krijgen nieuwe inhoud
- **Hernummeren**: Alle overgebleven stappen worden doorlopend genummerd van 1 t/m 12

## Nieuwe stappenstructuur

| Nieuw nr | Oud nr | Titel | Wijziging |
|----------|--------|-------|-----------|
| 1 | 1 | Toegang regelen | Ongewijzigd |
| 2 | 2 | URL Database updaten | Ongewijzigd |
| 3 | 6 | Koppelen met Google Sheets | **Nieuwe tekst** + bestaande tip behouden |
| 4 | 7 | Sitemaps toevoegen | Ongewijzigd |
| 5 | 8 | Bedrijfskennis invullen | Ongewijzigd |
| 6 | 9 | Admin Instellingen configureren | **Nieuwe tekst** |
| 7 | 10 | Testen | Ongewijzigd |
| 8 | 11 | Basisinstellingen | Ongewijzigd |
| 9 | 12 | Beeldmateriaal kiezen | Ongewijzigd (referentie naar "Stap 4" verwijderd) |
| 10 | 13 | Publicatie status | Ongewijzigd |
| 11 | 16 | Categorieen (Optioneel) | Ongewijzigd |
| 12 | 17 | Finalisering | Ongewijzigd |

## Gewijzigde inhoud

**Stap 3 (was 6):**
> Ga naar pagina URL instellingen. Open het "SEO pagina URL's" bestand in google drive. Haal de Grid ID op en vul in.
> Tip: (bestaande tip behouden)

**Stap 6 (was 9):**
> Admin Instellingen configureren
> Klap de Admin instellingen open. Open het bestand [BEDRIJFSNAAM] seo in Google Drive:
> Open het tab "Zoekwoord nieuw": Haal de Grid ID op en vul in

## Overige aanpassingen

- **Deel 1** bevat nu stappen 1-2 (was 1-4)
- **Deel 2** bevat nu stappen 3-4 (was 5-7)
- **Deel 4** bevat nu stappen 8-12 (was 11-17)
- In stap 9 (Beeldmateriaal) wordt de referentie "bedrijfsmap (uit Stap 4)" gewijzigd naar "bedrijfsmap" zonder stapverwijzing

## Technisch

Alleen het bestand `src/pages/SeoBlog.tsx` wordt aangepast, regels 636-845 (de guide content).

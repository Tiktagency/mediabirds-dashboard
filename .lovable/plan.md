

## Stap 2 en 3 verwijderen uit de SEO blog handleiding

### Wat verandert er
Stap 2 ("URL Database updaten") en stap 3 ("Koppelen met Google Sheets") worden verwijderd uit de handleiding. Alle opvolgende stappen worden hernummerd (4 wordt 2, 5 wordt 3, 6 wordt 4, etc.), zodat de nummering doorlopend blijft van 1 tot 11.

### Overzicht nieuwe nummering

| Oud | Nieuw | Stap |
|-----|-------|------|
| 1   | 1     | Toegang regelen |
| ~~2~~ | -   | ~~URL Database updaten~~ (verwijderd) |
| ~~3~~ | -   | ~~Koppelen met Google Sheets~~ (verwijderd) |
| 4   | 2     | Sitemaps toevoegen |
| 5   | 3     | URL's documenteren |
| 6   | 4     | Bedrijfskennis invullen |
| 7   | 5     | Admin Instellingen configureren |
| 8   | 6     | Testen |
| 9   | 7     | Basisinstellingen |
| 10  | 8     | Beeldmateriaal kiezen |
| 11  | 9     | Publicatie status |
| 12  | 10    | Categorieen (Optioneel) |
| 13  | 11    | Finalisering |

### Technische wijzigingen

**Bestand: `src/pages/SeoBlog.tsx`**

1. **Verwijder stap 2** (regels 661-668): Het blok "URL Database updaten".
2. **Verwijder stap 3** (regels 682-692): Het blok "Koppelen met Google Sheets" inclusief de tip-box.
3. **Hernummer alle overige stappen**: De nummers in de `<span>` elementen aanpassen van 4->2, 5->3, 6->4, 7->5, 8->6, 9->7, 10->8, 11->9, 12->10, 13->11.


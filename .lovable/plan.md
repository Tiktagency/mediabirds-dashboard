

# Vervanging SEO Blog Handleiding - Volledige Tekst

## Overzicht
De huidige handleiding wordt vervangen door de nieuwe 17-stappen handleiding. De exacte tekst van de gebruiker wordt behouden zonder aanpassingen. De visuele stijl (iconen, kleuren, stap-indicators) blijft hetzelfde.

## Bestand
`src/pages/SeoBlog.tsx` (regels 406-607)

## Nieuwe Structuur

### Introductie
**Exacte tekst:** "Volg dit stappenplan om een nieuwe klant volledig in te richten voor automatische bloggeneratie in het Mediabirds Dashboard."

### ID's Uitleg Sectie
*Behouden zoals nu* - Spreadsheet ID, Grid ID en Folder ID uitleg met voorbeelden

### Deel 1: Google Drive Inrichten (Blauw thema)
**Doel tekst:** "De database en documentstructuur voor de klant klaarzetten."

| Stap | Exacte tekst |
|------|-------------|
| 1 | **Toegang regelen:** Vraag toegang tot de centrale map "SEO" in Google Drive (beheerd door Tikt). |
| 2 | **URL Database updaten:** Open het bestand "SEO pagina URL's". Maak een nieuwe tab (sheet) aan en geef deze de naam van het bedrijf. Kopieer de kolommen van een bestaande bedrijfssheet naar deze nieuwe sheet. |
| 3 | **Bedrijfsdocument aanmaken:** Ga terug naar de hoofdmap "SEO". Kopieer het bestand "TEMPLATE: [BEDRIJFSNAAM] seo". Hernoem de kopie naar: [BEDRIJFSNAAM] seo (verwijder het woord 'TEMPLATE'). |
| 4 | **Klantmap organiseren:** Maak een nieuwe map aan binnen de map "SEO" met de naam van het bedrijf. Verplaats het zojuist aangemaakte bestand ([BEDRIJFSNAAM] seo) naar deze map. |

### Deel 2: Mediabirds Dashboard - Pagina URL's (Groen thema)
**Doel tekst:** "De sitemap koppelen voor interne linkbuilding."

| Stap | Exacte tekst |
|------|-------------|
| 5 | **Bedrijf selecteren:** Ga naar het Mediabirds Dashboard → SEO. Selecteer rechtsboven in de dropdown het juiste bedrijf of voeg een nieuw bedrijf toe. |
| 6 | **Koppelen met Google Sheets:** Ga naar Pagina URL Instellingen. Vul hier de Spreadsheet ID en de Sheet ID (Grid ID) in van de sheet die je in Stap 2 hebt aangemaakt. *Tip: Je vindt deze ID's in de URL van je browser wanneer de specifieke sheet openstaat.* |
| 7 | **Sitemaps toevoegen:** Ga naar de website van de klant en surf naar [domeinnaam]/sitemap.xml. Identificeer de relevante sitemaps (bijv. de page-sitemap of post-sitemap). Kopieer de relevante URL's en plak deze in het dashboard onder Pagina URLs. Gebruik de knop "URL toevoegen" voor extra velden. |

### Deel 3: Zoekwoord Onderzoek (Oranje thema)
**Doel tekst:** "De AI voeden met de juiste zoekwoorddata."

| Stap | Exacte tekst |
|------|-------------|
| 8 | **Bedrijfskennis invullen:** Vul de gevraagde velden in op basis van de briefing of jouw kennis van het bedrijf. |
| 9 | **Admin Instellingen configureren:** Klap de Admin instellingen open. Open het bestand [BEDRIJFSNAAM] seo in Google Drive: Hoofdzoekwoorden: Gebruik de Spreadsheet ID en Sheet ID van de eerste tab. Nieuwe zoekwoorden: Gebruik de Spreadsheet ID en Sheet ID van de tweede tab (Zoekwoord nieuwe). |
| 10 | **Testen:** Klik op de knop om de koppeling te testen. Werkt het? Ga door naar stap 11. Foutmelding? Neem contact op met Luc de Graag. |

### Deel 4: Blog Generatie (Roze thema)
**Doel tekst:** "De daadwerkelijke creatie en publicatie van content instellen."

| Stap | Exacte tekst |
|------|-------------|
| 11 | **Basisinstellingen:** Vul de velden in tot en met de sectie "Taal". |
| 12 | **Beeldmateriaal kiezen:** Maak een keuze tussen AI-gegenereerde afbeeldingen of eigen foto's: **Optie A (AI Afbeeldingen):** Vul de hex-kleurcodes in die passen bij de huisstijl. **Optie B (Eigen foto's):** Maak in de bedrijfsmap (uit Stap 4) twee mappen aan: Foto's [bedrijfsnaam] en Gebruikte foto's [bedrijfsnaam]. Kopieer de Folder ID's uit de URL-balk van je browser. Plak deze ID's in de juiste velden in het dashboard. |
| 13 | **Publicatie status:** Kies tussen Draft (concept) of Publish (direct live). *Advies: Begin altijd met 'Draft' om de kwaliteit van de eerste blogs te controleren.* |
| 14 | **Spreadsheet koppeling herhalen:** Vul de Spreadsheet ID en Sheet ID in van het bestand [BEDRIJFSNAAM] seo (eerste tab) voor de blog-output. |
| 15 | **API Koppelingen (WordPress):** Stel de verbinding met de website in door de volgende URL's aan te passen: POST afbeelding URL: https://[domeinnaam]/wp-json/wp/v2/media. POST blog URL: https://[domeinnaam]/wp-json/wp/v2/posts. (Vervang [domeinnaam] door de werkelijke URL van de klant, bijv. mediabirds.nl). |
| 16 | **Categorieën (Optioneel):** Indien de klant specifieke WordPress-categorieën gebruikt, vul deze dan in het betreffende veld in. |
| 17 | Vraag Luc of de koppeling met de bedrijfswebsite is gelegd. |

### Succes Banner
**Exacte tekst:** "Klaar! De automatische blogflow is nu ingesteld. Vergeet niet een laatste check te doen op de eerste gegenereerde concepten."

## Visuele Implementatie

**Kleuren per deel:**
- Deel 1: `blue-500` (Google Drive)
- Deel 2: `green-500` (Dashboard)
- Deel 3: `orange-500` (Zoekwoorden)
- Deel 4: `pink-500` (Blog Generatie)

**Iconen:**
- Deel 1: `FolderOpen`
- Deel 2: `Settings2`
- Deel 3: `Search`
- Deel 4: `PenTool`

**Nieuwe elementen:**
- Elke stap krijgt een titel in bold + volledige beschrijving
- Tips worden weergegeven in een aparte info-box met `Lightbulb` icoon
- Stap 12 krijgt een A/B split weergave voor de twee opties
- Waarschuwings-achtige stijl voor stappen die contact met Luc vereisen (10, 17)


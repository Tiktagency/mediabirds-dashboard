

## WordPress Alt-Tekst pagina: tekstvlak verwijderen en dropdown verplaatsen

### Wat er verandert
1. Het volledige tekstvlak (Card met uitleg en bedrijvenlijst) wordt verwijderd
2. De bedrijfsselector wordt verplaatst naar een vaste navigatiebalk bovenaan, rechts uitgelijnd -- dezelfde positie als op de SEO/Blog-pagina
3. De Dashboard-knop verhuist ook naar deze navigatiebalk (links)
4. Nieuw aangemaakte bedrijven verschijnen als eerste in de lijst (sortering op `created_at DESC` in plaats van op `name`)

### Aanpassingen

**1. `src/components/wordpress-alt-text/AltTextCompanySelector.tsx`**
- Sorteer bedrijven op `created_at` descending (`.order('created_at', { ascending: false })`) zodat het nieuwst aangemaakte bedrijf altijd bovenaan staat

**2. `src/pages/WordpressAltText.tsx`**
- Verwijder de Card-component met alle uitlegtekst en bedrijvenlijst
- Verwijder de `companies` state (niet meer nodig zonder de lijst)
- Voeg een vaste navigatiebalk toe bovenaan (net als de SEO-pagina):
  - Links: Dashboard-knop
  - Rechts: AltTextCompanySelector
- De `AltTextCompanySelector` krijgt geen `onCompaniesChange` prop meer nodig (wordt vereenvoudigd)
- De pagina-inhoud bevat alleen nog de titel, gecentreerd onder de navigatiebalk


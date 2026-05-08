
# Plan: Volgorde Tiles Aanpassen

## Overzicht

De drie navigatie-tiles op de SEO pagina herordenen naar de gewenste volgorde.

---

## Huidige volgorde

| Positie | Tile |
|---------|------|
| Links | Zoekwoord Onderzoek |
| Midden | Blog Generatie |
| Rechts | Pagina URL |

## Nieuwe volgorde

| Positie | Tile |
|---------|------|
| Links | Pagina URL |
| Midden | Zoekwoord Onderzoek |
| Rechts | Blog Generatie |

---

## Technische wijziging

**Bestand:** `src/pages/SeoBlog.tsx`

De drie button-blokken binnen de grid container (regels 202-311) worden herschikt:

1. **Pagina URL button** (regels 276-311) → verplaatsen naar eerste positie
2. **Zoekwoord Onderzoek button** (regels 202-237) → verplaatsen naar tweede positie
3. **Blog Generatie button** (regels 239-274) → blijft op derde positie

De inhoud van de form area (keyword, blog, pageurl forms) blijft ongewijzigd aangezien die op basis van `activeView` state worden getoond.

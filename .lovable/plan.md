

## Animatie: "Voor en Na" WordPress velden met pijl

### Wat er verandert
Boven de huidige invulvelden (bedrijfsnaam/domeinnaam) komen twee vereenvoudigde WordPress-panelen naast elkaar:
- **Links**: paneel met lege velden (voor-situatie)
- **Rechts**: paneel met ingevulde velden (na-situatie)
- **Ertussen**: een geanimeerde pijl die van links naar rechts wijst

Wanneer je op "Start" klikt, speelt er een animatie af die visueel laat zien dat de lege velden worden ingevuld.

### Visuele weergave

```
+-----------------------------------------------+
|  Dashboard                        [Dropdown]   |
+-----------------------------------------------+
|                                                |
|           Alt-tekst wordpress                  |
|                                                |
|  +------------------+  -->  +------------------+
|  | Alternatieve     |       | Alternatieve     |
|  |   tekst: [    ]  |       |   tekst: [xxxxx] |
|  | Titel: [      ]  |  ==>  | Titel: [xxxxx]  |
|  | Bijschrift: [  ] |       | Bijschrift:[xxx] |
|  | Beschrijving:[ ] |       | Beschrijving:[x] |
|  +------------------+       +------------------+
|                                                |
|       +----------------------------+           |
|       | Bedrijfsnaam: [........]   |           |
|       | Domeinnaam:   [........]   |           |
|       +----------------------------+           |
|              [ Start ]                         |
+-----------------------------------------------+
```

### Animatie-gedrag
- Bij klik op "Start": de lege velden in het linker paneel worden een-voor-een "ingevuld" met voorbeeldtekst (typing/fade-in effect)
- De pijl pulseert of animeert tijdens het proces
- Na afloop zijn beide panelen gevuld (visuele bevestiging)
- De animatie reset zich wanneer een nieuw bedrijf wordt geselecteerd

### Aanpassingen

**`src/pages/WordpressAltText.tsx`**

- Voeg een nieuw component/sectie toe boven de bedrijfsgegevens card
- Maak twee "WordPress panelen" als styled divs met de veldnamen uit de screenshots:
  - Alternatieve tekst
  - Titel
  - Bijschrift
  - Beschrijving
- Linker paneel: velden beginnen leeg
- Rechter paneel: velden zijn altijd gevuld met voorbeeldtekst
- Voeg een SVG-pijl of CSS-pijl toe tussen de twee panelen
- Voeg animatie-state toe (`isAnimating`) die wordt getriggerd bij "Start"
- Bij Start: speel een staggered animatie af waarbij de lege velden in het linker paneel een-voor-een worden gevuld (met een typing- of fade-in effect)
- Gebruik CSS keyframes en `transition` voor de animatie
- De pijl krijgt een pulserende animatie tijdens het vullen

**`src/index.css`**

- Voeg keyframes toe voor de typing/fill-animatie
- Voeg een pijl-puls animatie toe

### Technische details

- State: `isAnimating` boolean + `filledFields` array die bijhoudt welke velden al "ingevuld" zijn
- Bij Start: eerst animatie starten (staggered met `setTimeout` per veld, ~400ms interval), daarna pas de webhook aanroepen
- Voorbeeldteksten voor het rechter (en uiteindelijk linker) paneel:
  - Alternatieve tekst: "Tablet met grafieken en diagrammen..."
  - Titel: "Tablet met data-analyse interface"
  - Bijschrift: "Tablet toont geavanceerde grafieken..."
  - Beschrijving: "Afbeelding van een tablet met diverse..."
- De panelen krijgen `bg-white rounded-lg border shadow` styling (WordPress-achtig, licht thema) om het contrast met de donkere achtergrond te versterken
- Responsive: op smalle schermen stapelen de panelen verticaal met de pijl ertussen


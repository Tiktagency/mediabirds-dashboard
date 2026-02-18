

## Start-knop blokkeren bij actieve trigger + beschrijving toevoegen

### 1. Beschrijving onder de titel

Direct onder de titel "Alt-tekst wordpress" komt een beschrijvende tekst:

> "Vul nu automatisch de alt-tekst velden in voor ALLE afbeeldingen op je website! Voeg zoveel websites toe als je wilt en ga lekker achterover zitten in je stoel."

Gestyled als `text-muted-foreground` met wat marge, gecentreerd.

### 2. Start-knop uitschakelen bij actieve trigger

Net als bij de SEO/Blog pagina's wordt de Start-knop disabled wanneer de automatische trigger is ingeschakeld (`schedule?.enabled === true`). De knop toont dan "Automatische trigger actief" met een Clock-icoon.

### Aanpassingen

**`src/pages/WordpressAltText.tsx`**

- Voeg een `<p>` element toe direct onder de `<h1>` titel met de beschrijvingstekst
- Importeer `Clock` icoon uit lucide-react
- Bereken `const scheduleEnabled = schedule?.enabled === true`
- Wijzig de Start-knop:
  - `disabled={isStarting || scheduleEnabled}`
  - Bij `scheduleEnabled`: toon Clock-icoon + "Automatische trigger actief"
  - Anders: bestaande logica (Start / Bezig met starten)

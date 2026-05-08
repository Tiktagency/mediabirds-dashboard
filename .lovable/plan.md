

## Fix: Pagina niet klikbaar na sluiten profielmodal

### Probleem
Wanneer je het profielscherm opent via het instellingen-menu en het weer sluit, wordt `pointer-events: none` op de `<body>` gezet en niet opgeruimd. Dit is een bekend conflict tussen Radix UI's DropdownMenu en Dialog componenten -- beide proberen `pointer-events` op de body te beheren, en bij het sluiten wordt de cleanup niet correct uitgevoerd.

### Oplossing
Voeg een `onCloseAutoFocus` handler toe aan de `DialogContent` in `ProfileModal.tsx` die ervoor zorgt dat `pointer-events` op de body wordt hersteld bij het sluiten van de modal.

### Aanpassing

**`src/components/ProfileModal.tsx`** (regel 91)

Huidige code:
```
<DialogContent className="sm:max-w-md bg-card border-border">
```

Nieuwe code:
```
<DialogContent 
  className="sm:max-w-md bg-card border-border"
  onCloseAutoFocus={(e) => {
    e.preventDefault();
    document.body.style.pointerEvents = '';
  }}
>
```

Dit is een eenregelige fix die het conflict tussen DropdownMenu en Dialog oplost door expliciet `pointer-events` te resetten wanneer de dialog sluit.

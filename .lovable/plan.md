

## Spreadsheet ID veld rekt nog steeds uit

### Probleem

`min-w-0` op het veld zelf is niet voldoende. Het probleem zit in de parent-elementen: de `space-y-2` wrapper en de `flex-1` container hebben geen `overflow-hidden`, waardoor lange tekst de hele kolom breder maakt.

### Oplossing

Voeg `overflow-hidden` toe aan twee parent-elementen zodat de breedte hard begrensd wordt:

1. **Regel 197** -- De linker kolom `flex-1 w-full space-y-4`: voeg `overflow-hidden` toe
2. **Regel 199** -- Elke `space-y-2` wrapper rond de velden: voeg `overflow-hidden` toe (of beter: voeg het toe aan de card container op regel 198)

Concreet:

### Technische details

**Regel 197 -- Linker kolom container:**
```
// Was:
<div className="flex-1 w-full space-y-4">

// Wordt:
<div className="flex-1 w-full space-y-4 overflow-hidden">
```

**Regel 198 -- Card container:**
```
// Was:
<div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">

// Wordt:
<div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4 overflow-hidden">
```

Dit zorgt ervoor dat geen enkel child-element breder kan worden dan de beschikbare ruimte, ongeacht hoe lang de tekst is.

| Bestand | Wijziging |
|---|---|
| `src/pages/Landingspagina.tsx` | `overflow-hidden` toevoegen aan regel 197 en 198 |



## Fix: Tooltip wordt afgeknipt door `overflow-hidden` op parent container

### Oorzaak

Het probleem zit NIET in de z-index. De parent container van het formulier (regel 202) heeft `overflow-hidden`:

```
<div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-3 overflow-hidden">
```

Dit knipt alles af wat buiten de grenzen van die div valt -- inclusief de tooltips. Een hogere z-index helpt hier niet, want `overflow-hidden` is een harde clip.

### Oplossing

**Bestand: `src/pages/Landingspagina.tsx`**

1. **Verwijder `overflow-hidden` van de kaart-container (regel 202)**
   - Verander `overflow-hidden` naar `overflow-visible` zodat tooltips buiten de container kunnen verschijnen.

2. **Verwijder ook `overflow-hidden` van de parent wrapper (regel 201)**
   - De wrapper `<div className="flex-1 w-full space-y-4 overflow-hidden">` knipt ook af.
   - Verander naar `overflow-visible`.

| Regel | Was | Wordt |
|---|---|---|
| 201 | `flex-1 w-full space-y-4 overflow-hidden` | `flex-1 w-full space-y-4` |
| 202 | `bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-3 overflow-hidden` | `bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-3` |

De `overflow-hidden` was oorspronkelijk toegevoegd om lange teksten in velden te beperken, maar dat wordt al afgehandeld door `truncate` en `overflow-hidden` op de individuele invoervelden zelf. Het is dus veilig om het van de parent containers te verwijderen.


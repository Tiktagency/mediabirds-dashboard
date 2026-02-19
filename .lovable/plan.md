

## Velden standaard ingeklapt houden en uitklappen bij klik

### Probleem

De `truncate` CSS-class op de ingeklapte velden werkt niet correct omdat het parent-element in een flex-layout zit zonder expliciete breedtebeperking. Daardoor groeit het veld mee met de tekst in plaats van de tekst af te kappen.

### Oplossing in `src/pages/Landingspagina.tsx`

**Collapsed state (standaard, niet geselecteerd):**
- Voeg `min-w-0` toe aan de container zodat `truncate` werkt binnen flex-layouts
- Behoud `h-[40px]`, `overflow-hidden` en `truncate` op de span

**Expanded state (na klik):**
- Verwijder de vaste hoogte zodat het veld kan groeien
- Behoud `break-all` zodat lange teksten zoals Spreadsheet IDs netjes wrappen
- Voeg `min-w-0` toe voor consistentie

### Technische details

Wijzigingen in de `renderEditableField` functie:

| Regel | Element | Wijziging |
|---|---|---|
| 131 | Expanded container | `min-w-0` toevoegen |
| 144-146 | Collapsed container | `min-w-0` toevoegen |

```
// Collapsed (standaard) - tekst afgekapt
className="px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white h-[40px] flex items-center overflow-hidden cursor-pointer hover:bg-white/10 transition-colors min-w-0"

// Expanded (na klik) - hele tekst zichtbaar
className="expanded-field-container relative px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/20 text-white min-h-[40px] overflow-hidden min-w-0"
```

| Bestand | Wijziging |
|---|---|
| `src/pages/Landingspagina.tsx` | `min-w-0` toevoegen aan collapsed en expanded containers in `renderEditableField` |

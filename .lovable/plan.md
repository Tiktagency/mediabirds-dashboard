

## Spreadsheet ID veld mag niet uitrekken

### Wat verandert er

Wanneer je een lange waarde invoert (zoals een Spreadsheet ID), blijft het veld op zijn vaste breedte en rekt het niet uit.

### Aanpassing in `src/pages/Landingspagina.tsx`

**`renderEditableField` functie -- 3 plekken:**

1. **Input veld (regel 119-126)**: voeg `className` `overflow-hidden` toe en een `style={{ minWidth: 0 }}` zodat het input-element niet groeit
2. **Expanded view (regel 131)**: voeg `overflow-hidden break-all` toe aan de container, en `truncate` of `break-all` aan de `<span>` zodat lange tekst wrapt of afgekapt wordt in plaats van het veld uit te rekken
3. **Collapsed view (regel 144-149)**: al correct met `truncate` en `overflow-hidden`

### Technische details

**Regel 124 -- Input:**
```
className="bg-white/5 border-white/20 text-white placeholder:text-white/30 w-full overflow-hidden"
```

**Regel 131 -- Expanded container:**
```
className="expanded-field-container relative px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/20 text-white min-h-[40px] overflow-hidden"
```

**Regel 132 -- Expanded span:**
```
<span className={`break-all ${!value ? 'text-white/30' : ''}`}>
```

| Bestand | Wijziging |
|---|---|
| `src/pages/Landingspagina.tsx` | `overflow-hidden` en `break-all` toevoegen aan renderEditableField |

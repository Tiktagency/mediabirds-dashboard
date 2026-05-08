
## Nieuw veld "Pagina url" toevoegen

### Wat verandert er

Er komt een nieuw invulveld "Pagina url" onder het Grid ID veld, met een info-icoon dat bij hover de tekst toont: "De pagina die je wilt gebruiken in de nieuwe context".

### Stappen

1. **Database**: Een nieuwe kolom `page_url` (text, nullable) toevoegen aan de `landing_companies` tabel.

2. **Frontend (`src/pages/Landingspagina.tsx`)**:
   - Nieuwe state: `const [editPageUrl, setEditPageUrl] = useState('')`
   - In het `useEffect` bij bedrijfsselectie: `setEditPageUrl(selectedCompany?.page_url || '')`
   - `handleFieldSave` uitbreiden met `'page_url'` als optie
   - Nieuw veld toevoegen na Grid ID, met hetzelfde drie-stappen klik-patroon (`renderEditableField`)
   - Label "Pagina url:" met een `Info` tooltip: "De pagina die je wilt gebruiken in de nieuwe context"
   - Het veld is **niet** verplicht voor de Start-knop (tenzij gewenst)

3. **Webhook payload**: `page_url` meesturen in de body van `trigger-landing-webhook`

### Technische details

**Database migratie:**
```sql
ALTER TABLE landing_companies ADD COLUMN page_url text;
```

**Nieuw veld in JSX (na Grid ID):**
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-1.5">
    <Label className="text-white/70">Pagina url:</Label>
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-white/40 hover:text-white/70 cursor-help transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-card border-border text-white p-3">
          <p className="text-sm text-white/80">De pagina die je wilt gebruiken in de nieuwe context</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  {renderEditableField('page_url', editPageUrl, setEditPageUrl, 
    () => handleFieldSave('page_url', editPageUrl), 'Voer pagina url in...')}
</div>
```

| Bestand | Wijziging |
|---|---|
| Database migratie | Kolom `page_url` toevoegen aan `landing_companies` |
| `src/pages/Landingspagina.tsx` | State, useEffect, save-handler, veld met tooltip, webhook payload |

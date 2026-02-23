

## Fix: verwijderd bedrijf blijft geselecteerd in dropdown

### Probleem

Wanneer het geselecteerde bedrijf wordt verwijderd:
1. `setSelectedCompany(null)` wordt aangeroepen, maar `onSelect?.(null)` wordt **niet** aangeroepen -- de parent component weet dus niet dat de selectie is gewist
2. `fetchCompanies()` controleert `!selectedCompany`, maar die check gebruikt de **oude** waarde uit de closure (nog niet null), dus er wordt geen nieuw bedrijf automatisch geselecteerd

### Oplossing

In `handleDeleteCompany` van beide bestanden:
- Direct `onSelect?.(null)` aanroepen wanneer het geselecteerde bedrijf wordt verwijderd
- Na het ophalen van de bijgewerkte lijst, automatisch het eerste beschikbare bedrijf selecteren

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/components/landing/LandingCompanySelector.tsx` | `onSelect?.(null)` toevoegen bij verwijdering + na fetch eerste bedrijf selecteren |
| `src/components/wordpress-alt-text/AltTextCompanySelector.tsx` | Zelfde fix toepassen |

### Technisch detail

In `handleDeleteCompany` (regels 142-166 in Landing, vergelijkbaar in AltText):

```ts
// Was:
if (selectedCompany?.id === companyToDelete.id) {
  setSelectedCompany(null);
}
setCompanyToDelete(null);
await fetchCompanies();

// Wordt:
const wasSelected = selectedCompany?.id === companyToDelete.id;
setCompanyToDelete(null);
// Fetch bijgewerkte lijst
const { data } = await supabase
  .from('landing_companies') // of 'alt_text_companies'
  .select('*')
  .order('created_at', { ascending: false });
const list = (data || []) as LandingCompany[];
setCompanies(list);
if (wasSelected) {
  const next = list.length > 0 ? list[0] : null;
  setSelectedCompany(next);
  onSelect?.(next);
}
```

Dit zorgt ervoor dat na verwijdering direct het volgende bedrijf wordt geselecteerd, of de selector op "Selecteer bedrijf" valt als er geen bedrijven meer zijn.



# Plan: Admin Instellingen Sectie voor PageUrlForm

## Overzicht
De "Spreadsheet ID" en "Grid ID" velden verplaatsen naar een inklapbare "Admin instellingen" sectie in het Pagina URL formulier, vergelijkbaar met de implementatie in BlogGenerationForm.

---

## Huidige situatie

De velden staan nu direct in het formulier:
```
Bedrijfsnaam (read-only)
Spreadsheet ID
Grid ID
Pagina URLs
[URL's documenteren]
```

---

## Nieuwe structuur

```
Bedrijfsnaam (read-only)
Pagina URLs
[Admin instellingen ▼]  ← Alleen zichtbaar voor admins
   Spreadsheet ID
   Grid ID
[URL's documenteren]
```

---

## Technische wijzigingen

### Bestand: `src/components/seo-blog/PageUrlForm.tsx`

**1. Nieuwe imports:**
```typescript
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
```

**2. Nieuwe state:**
```typescript
const [adminSettingsOpen, setAdminSettingsOpen] = useState(false);
```

**3. Verplaatsen Spreadsheet ID en Grid ID velden:**
- Verwijder deze velden van hun huidige locatie (regels 214-238)
- Plaats ze in een Collapsible component na de Pagina URLs sectie

**4. Collapsible sectie toevoegen:**
```tsx
{isAdmin && (
  <Collapsible 
    open={adminSettingsOpen} 
    onOpenChange={setAdminSettingsOpen}
    className="pt-6 border-t border-white/10"
  >
    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-white/5 rounded-md px-2 transition-colors">
      <p className="text-sm text-yellow-400/80 font-medium">Admin instellingen</p>
      <ChevronDown className={cn(
        "h-4 w-4 text-yellow-400/80 transition-transform duration-200",
        adminSettingsOpen && "rotate-180"
      )} />
    </CollapsibleTrigger>
    <CollapsibleContent className="space-y-4 pt-4">
      {/* Spreadsheet ID */}
      <div className="space-y-2">
        <Label className="text-white/70">Spreadsheet ID</Label>
        <Input ... />
      </div>
      {/* Grid ID */}
      <div className="space-y-2">
        <Label className="text-white/70">Grid ID</Label>
        <Input ... />
      </div>
    </CollapsibleContent>
  </Collapsible>
)}
```

---

## Visueel resultaat

| Element | Zichtbaar voor |
|---------|----------------|
| Bedrijfsnaam | Iedereen |
| Pagina URLs | Iedereen (alleen admin kan bewerken) |
| Admin instellingen | Alleen admins |
| URL's documenteren knop | Alleen admins |

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/seo-blog/PageUrlForm.tsx` | Collapsible admin sectie toevoegen, velden verplaatsen |

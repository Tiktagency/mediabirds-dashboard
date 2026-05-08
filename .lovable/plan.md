
# Plan: Info Tooltip Toevoegen aan Pagina URLs

## Overzicht

Een info-icoon met tooltip toevoegen naast het "Pagina URLs" label om gebruikers te informeren over de vereisten voor dit veld.

---

## Wijzigingen

### Bestand: `src/components/seo-blog/PageUrlForm.tsx`

**1. Imports toevoegen (regel 5):**
- `Info` icoon van lucide-react
- Tooltip componenten van `@/components/ui/tooltip`

**2. Label aanpassen (regel 147):**

Huidige code:
```tsx
<Label className="text-white/70">Pagina URLs</Label>
```

Nieuwe code:
```tsx
<div className="flex items-center gap-2">
  <Label className="text-white/70">Pagina URLs</Label>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-white/50 hover:text-white/70 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-background border border-white/20 text-white p-3">
        <p className="text-sm">
          De site moet een xml sitemap hebben om dit veld in te vullen. 
          Aanwezig: pak de belangrijkste links waar de pagina's onder vallen 
          waarvan je de info wilt documenteren, zodat de ai agent interne 
          links kan leggen naar deze pagina's.
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
```

---

## Visueel Resultaat

- Een klein info-icoon (ⓘ) verschijnt naast "Pagina URLs"
- Bij hover verschijnt een tooltip met de uitleg over XML sitemaps
- Styling consistent met de rest van het dark theme

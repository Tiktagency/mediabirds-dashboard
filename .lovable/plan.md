

# Plan: Gecentreerde Titels en Uitklapbare Admin Instellingen

## Huidige Situatie

| Formulier | Titel positie | Admin uitklapbaar |
|-----------|---------------|-------------------|
| PageUrlForm | Links | Ja (Collapsible) |
| KeywordResearchForm | Links | Nee (gewone div) |
| BlogGenerationForm | Links | Ja (Collapsible) |

## Wijzigingen

### 1. PageUrlForm.tsx

**Regel 207:** Titel centreren
```tsx
// Was:
<h2 className="text-xl font-semibold text-white mb-6">Pagina URL Instellingen</h2>

// Wordt:
<div className="text-center mb-6">
  <h2 className="text-xl font-semibold text-white">Pagina URL Instellingen</h2>
  <p className="text-sm text-white/50 mt-1">Beheer sitemap URLs voor interne linkbuilding</p>
</div>
```

### 2. KeywordResearchForm.tsx

**Regel 494:** Titel centreren
```tsx
// Was:
<h2 className="text-xl font-semibold text-white mb-6">Zoekwoord onderzoek instellingen</h2>

// Wordt:
<div className="text-center mb-6">
  <h2 className="text-xl font-semibold text-white">Zoekwoord onderzoek instellingen</h2>
  <p className="text-sm text-white/50 mt-1">Configureer je AI-gestuurd SEO onderzoek</p>
</div>
```

**Regels 522-551:** Admin instellingen uitklapbaar maken
```tsx
// Was: gewone div met "Admin instellingen" tekst

// Wordt: Collapsible component (zoals in andere formulieren)
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
    <CollapsibleContent className="space-y-6 pt-4">
      {/* Hoofd zoekwoorden sectie */}
      ...
      {/* Nieuwe zoekwoorden sectie */}
      ...
    </CollapsibleContent>
  </Collapsible>
)}
```

**Toevoegen:** State en imports
- Toevoegen: `useState` voor `adminSettingsOpen`
- Toevoegen: `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` imports
- Toevoegen: `ChevronDown` icon import

### 3. BlogGenerationForm.tsx

**Regel 576:** Titel centreren
```tsx
// Was:
<h2 className="text-xl font-semibold text-white mb-6">Blog generatie instellingen</h2>

// Wordt:
<div className="text-center mb-6">
  <h2 className="text-xl font-semibold text-white">Blog generatie instellingen</h2>
  <p className="text-sm text-white/50 mt-1">Configureer automatische blog creatie</p>
</div>
```

## Samenvatting

| Bestand | Wijziging |
|---------|-----------|
| PageUrlForm.tsx | Titel + subtitel centreren |
| KeywordResearchForm.tsx | Titel + subtitel centreren + Admin collapsible maken |
| BlogGenerationForm.tsx | Titel + subtitel centreren |

## Resultaat

Alle drie formulieren krijgen:
- Gecentreerde titel met beschrijvende subtitel
- Consistente uitklapbare Admin instellingen met ChevronDown icoon



# Plan: Consistentie Pagina URL Sectie

## Overzicht

Twee aanpassingen nodig om de "Pagina URL" sectie consistent te maken met de andere secties:
1. De knopkleur aanpassen van oranje naar de standaard themakleur
2. Het Bedrijfsnaam veld dezelfde gradient-border styling geven

---

## Wijzigingen

### 1. Knopkleur aanpassen in `src/pages/SeoBlog.tsx`

De "Pagina URL" button gebruikt nu `bg-orange-500`, maar moet dezelfde kleuren gebruiken als de andere buttons (`bg-secondary`/`bg-accent`).

**Huidige code (regels 276-311):**
- `bg-orange-500` en `shadow-orange-500/20`

**Nieuwe code:**
- `bg-secondary` en `shadow-secondary/20`
- Tekst- en icoonkleuren aanpassen naar `text-secondary-foreground`

### 2. Bedrijfsnaam veld styling in `src/components/seo-blog/PageUrlForm.tsx`

Het Bedrijfsnaam veld moet dezelfde premium gradient border krijgen als in de andere formulieren:
- Gradient: `linear-gradient(135deg, #8b5cf6, #ec4899, #8b5cf6)` (paars naar roze)
- Alleen op de border, niet de achtergrond

**Huidige code (regel 99-105):**
```tsx
<Input
  value={selectedCompany.name}
  disabled
  className="bg-white/5 border-white/10 text-white/50"
/>
```

**Nieuwe code:**
```tsx
<div className="px-3 py-2 rounded-md bg-white/5 border-2 border-transparent text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]">
  {selectedCompany.name}
</div>
```

---

## Visueel Resultaat

Na de wijzigingen:
- Alle drie buttons hebben dezelfde sage-green kleur wanneer actief
- Het Bedrijfsnaam veld in alle drie formulieren heeft de paars-roze gradient border
- Consistente gebruikerservaring door de hele SEO-pagina

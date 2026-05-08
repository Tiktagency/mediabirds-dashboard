
# Plan: Company Selector Dropdown Kleur Aanpassen

## Probleem
De dropdown menu achtergrond gebruikt `bg-slate-900` (blauw-grijs), wat niet past bij de huisstijl.

## Oplossing
Verander de achtergrondkleur naar de kaartkleur uit de huisstijl: `bg-card` of `#1c1c1c`.

---

## Technische wijziging

### Bestand: `src/components/seo/CompanySelector.tsx`

**Regel 232 - DropdownMenuContent:**
```tsx
// Van:
className="bg-slate-900 border-white/20 min-w-[200px] z-50"

// Naar:
className="bg-card border-white/20 min-w-[200px] z-50"
```

Dit zorgt ervoor dat de dropdown dezelfde donkere achtergrond gebruikt als de rest van de interface, consistent met de sage green huisstijl.

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/seo/CompanySelector.tsx` | `bg-slate-900` → `bg-card` op regel 232 |

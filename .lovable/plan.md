
## Kleur preview uitrekken bij open trigger

**Probleem:** De preview card heeft `h-full` op de `<Card>`, maar de scrollbare container binnenin heeft `style={{ maxHeight: '560px', overflowY: 'auto' }}` (regel 662). Die vaste hoogte blokkeert het uitrekken wanneer de trigger-card openklapt.

**Oplossing:** De scrollbare container de volledige beschikbare hoogte laten innemen via flex. De card en zijn content moeten een doorgaande flex-keten vormen zodat de preview-div kan groeien.

**Wijziging in `src/pages/Nieuwsbrief.tsx`:**

1. **Regel 655** — Card: `h-full` → `h-full flex flex-col`  
2. **Regel 656** — CardContent: voeg `flex-1 flex flex-col` toe  
3. **Regel 662** — Scrollcontainer: verwijder `maxHeight: '560px'` en voeg `flex-1` toe als className + `overflowY: 'auto'` blijft staan

```tsx
// Regel 655
<Card className="bg-white/5 border-white/10 h-full flex flex-col">
  // Regel 656
  <CardContent className="p-4 flex-1 flex flex-col">
    <div className="flex items-center gap-2 mb-3">...</div>
    // Regel 662 — geen maxHeight meer, flex-1 zodat hij vult
    <div className="rounded-lg overflow-hidden border border-white/10 flex-1" style={{ overflowY: 'auto' }}>
      ...preview content...
    </div>
  </CardContent>
</Card>
```

Enkel bestand: `src/pages/Nieuwsbrief.tsx` (regels 655–662).

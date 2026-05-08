
# Plan: Handleiding Toevoegen aan SEO Pagina

## Overzicht
Een handleiding knop toevoegen aan de SEO pagina die een slide-out panel opent met stap-voor-stap instructies voor het opzetten van een blog.

---

## Locatie

De handleiding knop komt in de **top navigatiebalk**, links van de notificatie bel:

```
[Dashboard]                    [Bedrijf ▼] [📖] [🔔]
```

---

## UI Componenten

### 1. Handleiding Knop
- **Icoon:** `BookOpen` van lucide-react
- **Styling:** Zelfde stijl als de notificatie bel (bg-white/5, border-white/20)
- **Tooltip:** "Handleiding" bij hover

### 2. Handleiding Panel (Sheet)
- **Type:** `Sheet` component (slide-in van rechts)
- **Breedte:** 500px voor goede leesbaarheid
- **Inhoud:** Placeholder sectie met stappen (later aan te passen)

---

## Technische Implementatie

### Bestand: `src/pages/SeoBlog.tsx`

**Wijzigingen:**
1. Import `BookOpen` icoon en `Sheet` componenten
2. Nieuwe state: `isGuideOpen` 
3. Handleiding knop naast notificatie bel
4. Sheet component met placeholder inhoud

**Nieuwe imports:**
```typescript
import { BookOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
```

**Nieuwe state:**
```typescript
const [isGuideOpen, setIsGuideOpen] = useState(false);
```

**Knop in navigatiebalk (voor de notificatie bel):**
```tsx
<button
  onClick={() => setIsGuideOpen(true)}
  className="relative p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors"
  title="Handleiding"
>
  <BookOpen className="h-5 w-5 text-white" />
</button>
```

**Sheet component (onderaan de pagina):**
```tsx
<Sheet open={isGuideOpen} onOpenChange={setIsGuideOpen}>
  <SheetContent className="w-[500px] sm:max-w-[500px] bg-card border-border overflow-y-auto">
    <SheetHeader>
      <SheetTitle className="text-white text-xl">Blog Handleiding</SheetTitle>
    </SheetHeader>
    <div className="mt-6 space-y-6 text-white/80">
      <p>Hier komt de stap-voor-stap handleiding...</p>
      {/* Placeholder voor latere inhoud */}
    </div>
  </SheetContent>
</Sheet>
```

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/SeoBlog.tsx` | Handleiding knop en Sheet panel toevoegen |

---

## Volgende stap

Na implementatie kan de inhoud van de handleiding worden ingevuld met de specifieke stappen voor het opzetten van een blog.

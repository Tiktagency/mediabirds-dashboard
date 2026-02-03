
# Plan: Handleiding Inhoud Toevoegen aan SEO Pagina

## Overzicht
De door de gebruiker aangeleverde handleiding toevoegen aan het Blog Handleiding Sheet panel, met visuele elementen en symbolen voor optimale leesbaarheid.

---

## Structuur van de Handleiding

De handleiding wordt opgedeeld in duidelijke secties met iconen:

| Sectie | Icoon | Kleur |
|--------|-------|-------|
| Intro | 💡 Lightbulb | Yellow |
| ID's uitleg | 🔗 Link | Purple |
| Deel 1: Google Drive | 📁 Folder | Blue |
| Deel 2: Dashboard Config | ⚙️ Settings | Green |
| Deel 3: Zoekwoordonderzoek | 🔍 Search | Orange |
| Deel 4: Blog Generatie | ✍️ PenTool | Pink |
| Klaar | ✅ CheckCircle | Green |

---

## UI Design Elementen

### 1. Sectie Headers
```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="p-2 rounded-lg bg-blue-500/20">
    <FolderIcon className="h-5 w-5 text-blue-400" />
  </div>
  <h3 className="text-lg font-semibold text-white">Deel 1: Google Drive</h3>
</div>
```

### 2. Info Boxen (voor ID uitleg)
```tsx
<div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
  <p className="text-sm text-white/80">...</p>
</div>
```

### 3. Stappen Lijsten
```tsx
<div className="flex items-start gap-3">
  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">1</span>
  <p className="text-sm text-white/70">Stap beschrijving...</p>
</div>
```

### 4. Code/URL Voorbeelden
```tsx
<code className="px-2 py-1 rounded bg-white/10 text-xs text-purple-300 break-all">
  1u8Bm5XsTkAQBK4DYFgHjDMQMKLhbyeDVaG6JXcotLKk
</code>
```

### 5. Succes Banner (onderaan)
```tsx
<div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3">
  <CheckCircle className="h-6 w-6 text-green-400" />
  <p className="text-green-300 font-medium">Klaar! Het systeem is nu volledig geconfigureerd.</p>
</div>
```

---

## Technische Wijzigingen

### Bestand: `src/pages/SeoBlog.tsx`

**1. Nieuwe imports toevoegen:**
```typescript
import { 
  Lightbulb, 
  FolderOpen, 
  Settings2, 
  Search as SearchIcon, 
  PenTool, 
  CheckCircle2,
  Link2
} from 'lucide-react';
```

**2. Sheet content vervangen (regels 406-408):**
De placeholder tekst wordt vervangen door de volledige handleiding met:
- Intro sectie met belangrijke info over ID's
- Visuele voorbeelden van URL's met gemarkeerde ID's
- 4 genummerde delen met subsecties
- Checklijst stappen per sectie
- Afsluitende succes banner

---

## Volledige Handleiding Structuur

```
📖 Blog Handleiding
├── 💡 Belangrijk: ID's ophalen uit URL
│   ├── Spreadsheet ID & Grid ID uitleg
│   └── Folder ID uitleg
├── 📁 Deel 1: Google Drive Voorbereiding
│   ├── ① Toegang tot SEO map
│   ├── ② URL Spreadsheet setup
│   └── ③ Bedrijfssheet aanmaken
├── ⚙️ Deel 2: Dashboard Basisconfiguratie
│   ├── ① Bedrijf toevoegen
│   ├── ② Pagina URL's koppelen
│   └── ③ Sitemap indexeren
├── 🔍 Deel 3: Zoekwoordonderzoek
│   ├── ① ID's koppelen
│   └── ② Testen
├── ✍️ Deel 4: Blog Generatie & Publicatie
│   ├── ① Beeldmateriaal configureren
│   ├── ② Publicatie & API instellen
│   └── ③ Automatisering activeren
└── ✅ Klaar!
```

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `src/pages/SeoBlog.tsx` | Nieuwe icoon imports, volledige handleiding inhoud in Sheet component |

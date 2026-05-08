
# Plan: Bewerkbare SEO Blog Handleiding Titel (Alleen Super Admin)

## Overzicht
Een potloodicoon toevoegen achter de "SEO blog handleiding" titel die:
- Alleen zichtbaar is bij hover
- Alleen zichtbaar is voor Super Admins
- Tekst bewerkbaar maakt bij klik
- Opslaanfunctie bevat om wijzigingen te persisteren

---

## 1. Database Tabel Aanmaken

**Nieuwe tabel:** `app_settings`

```sql
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS inschakelen
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Iedereen mag lezen
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

-- Alleen super_admin mag schrijven
CREATE POLICY "Super admins can update settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Initiële waarde invoegen
INSERT INTO public.app_settings (key, value) 
VALUES ('seo_guide_title', 'SEO blog handleiding');
```

---

## 2. Frontend Wijzigingen

### Bestand: `src/pages/SeoBlog.tsx`

**Imports toevoegen:**
```typescript
import { Pencil, Save } from 'lucide-react';
```

**isSuperAdmin uit useAuth halen:**
```typescript
const { isLoading: authLoading, user, isAdmin, isSuperAdmin } = useAuth();
```

**Nieuwe state variabelen:**
```typescript
const [guideTitle, setGuideTitle] = useState('SEO blog handleiding');
const [isEditingTitle, setIsEditingTitle] = useState(false);
const [editedTitle, setEditedTitle] = useState('');
const [isSavingTitle, setIsSavingTitle] = useState(false);
```

**Titel laden bij mount:**
```typescript
useEffect(() => {
  const loadGuideTitle = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'seo_guide_title')
      .single();
    
    if (data?.value) {
      setGuideTitle(data.value);
    }
  };
  loadGuideTitle();
}, []);
```

**Opslaan functie:**
```typescript
const handleSaveTitle = async () => {
  if (!editedTitle.trim()) return;
  
  setIsSavingTitle(true);
  const { error } = await supabase
    .from('app_settings')
    .update({ value: editedTitle.trim(), updated_at: new Date().toISOString() })
    .eq('key', 'seo_guide_title');
  
  if (!error) {
    setGuideTitle(editedTitle.trim());
    setIsEditingTitle(false);
  }
  setIsSavingTitle(false);
};
```

**SheetTitle vervangen (regel 403-405):**

Van:
```tsx
<SheetHeader>
  <SheetTitle className="text-white text-xl">SEO blog handleiding</SheetTitle>
</SheetHeader>
```

Naar:
```tsx
<SheetHeader>
  <SheetTitle className="text-white text-xl flex items-center gap-2 group">
    {isEditingTitle ? (
      <>
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-white/40"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveTitle();
            if (e.key === 'Escape') setIsEditingTitle(false);
          }}
        />
        <button
          onClick={handleSaveTitle}
          disabled={isSavingTitle}
          className="p-1 rounded hover:bg-white/10 text-green-400"
          title="Opslaan"
        >
          <Save className="h-4 w-4" />
        </button>
      </>
    ) : (
      <>
        {guideTitle}
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditedTitle(guideTitle);
              setIsEditingTitle(true);
            }}
            className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Bewerken"
          >
            <Pencil className="h-4 w-4 text-white/60" />
          </button>
        )}
      </>
    )}
  </SheetTitle>
</SheetHeader>
```

---

## Gebruikerservaring

| Actie | Resultaat |
|-------|-----------|
| Hover over titel (niet super admin) | Geen verandering |
| Hover over titel (super admin) | Potloodicoon verschijnt |
| Klik op potlood | Invoerveld verschijnt met huidige tekst |
| Druk op Enter of klik opslaan | Titel wordt opgeslagen in database |
| Druk op Escape | Bewerkingsmodus geannuleerd |

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| Database migratie | `app_settings` tabel aanmaken |
| `src/pages/SeoBlog.tsx` | Bewerkbare titel met hover potlood |

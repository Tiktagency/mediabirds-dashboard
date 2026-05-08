

# Plan: Volledig Bewerkbare SEO Handleiding

## Overzicht
Het potloodicoon verplaatsen naar rechtsboven in het handleidingpaneel en de volledige tekst bewerkbaar maken voor Super Admins.

---

## Aanpak

De huidige handleiding bestaat uit hardcoded JSX met complexe opmaak. Om de volledige tekst bewerkbaar te maken, wordt de content opgeslagen in de database en gerenderd als Markdown.

---

## 1. Database Aanpassing

**Bestaande `app_settings` tabel gebruiken:**
- Key `seo_guide_title` hernoemen naar `seo_guide_content`
- Volledige handleiding opslaan als Markdown

```sql
UPDATE public.app_settings 
SET key = 'seo_guide_content', 
    value = '# SEO blog handleiding

Volg deze stappen om het SEO-dashboard voor een nieuw bedrijf te configureren...

## Belangrijk: ID''s ophalen uit URL

Voor de configuratie heb je verschillende ID''s nodig...

### Spreadsheet ID & Grid ID
...'
WHERE key = 'seo_guide_title';
```

---

## 2. Markdown Rendering Library

**Nieuwe dependency toevoegen:**
```bash
npm install react-markdown
```

Dit maakt het mogelijk om opgeslagen Markdown om te zetten naar gestylde HTML.

---

## 3. Frontend Wijzigingen (`src/pages/SeoBlog.tsx`)

### State aanpassen:
```typescript
const [guideContent, setGuideContent] = useState('');
const [isEditingGuide, setIsEditingGuide] = useState(false);
const [editedContent, setEditedContent] = useState('');
```

### SheetContent structuur:

```tsx
<SheetContent className="...">
  {/* Header met titel en bewerkknop rechtsboven */}
  <div className="flex items-center justify-between">
    <SheetTitle className="text-white text-xl">
      SEO blog handleiding
    </SheetTitle>
    
    {isSuperAdmin && !isEditingGuide && (
      <button
        onClick={() => {
          setEditedContent(guideContent);
          setIsEditingGuide(true);
        }}
        className="p-2 rounded hover:bg-white/10"
      >
        <Pencil className="h-4 w-4 text-white/60" />
      </button>
    )}
  </div>

  {/* Content gebied */}
  {isEditingGuide ? (
    <div className="mt-4 space-y-4">
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full h-[500px] bg-white/10 border border-white/20 rounded p-4 text-white text-sm font-mono"
      />
      <div className="flex gap-2">
        <Button onClick={handleSaveContent}>
          <Save className="h-4 w-4 mr-2" /> Opslaan
        </Button>
        <Button variant="ghost" onClick={() => setIsEditingGuide(false)}>
          Annuleren
        </Button>
      </div>
    </div>
  ) : (
    <div className="mt-6 prose prose-invert">
      <ReactMarkdown>{guideContent}</ReactMarkdown>
    </div>
  )}
</SheetContent>
```

### Styling voor Markdown:

```css
/* Toevoegen aan index.css of inline */
.prose-invert h2 { @apply text-lg font-semibold text-white mt-6 mb-3; }
.prose-invert h3 { @apply text-base font-medium text-white/90 mt-4 mb-2; }
.prose-invert p { @apply text-sm text-white/70 mb-2; }
.prose-invert ul { @apply list-disc pl-4 text-sm text-white/60; }
.prose-invert code { @apply bg-white/10 px-1 rounded text-xs; }
```

---

## 4. Initiële Content Migratie

De huidige hardcoded handleiding wordt omgezet naar Markdown en opgeslagen in de database:

```markdown
# SEO blog handleiding

Volg deze stappen om het SEO-dashboard voor een nieuw bedrijf te configureren. Na configuratie voert het systeem automatisch zoekwoordonderzoek uit en worden er SEO-geoptimaliseerde blogs gegenereerd.

## Belangrijk: ID's ophalen uit URL

Voor de configuratie heb je verschillende ID's nodig die je rechtstreeks uit de adresbalk van je browser kopieert.

### Spreadsheet ID & Grid ID

Voorbeeld URL:
`https://docs.google.com/spreadsheets/d/1u8Bm5XsTkAQBK4DYFgHjDMQMKLhbyeDVaG6JXcotLKk/edit?gid=0#gid=0`

- **Spreadsheet ID**: De lange reeks tussen `/d/` en `/edit`
- **Grid ID (gid)**: Het getal achter `gid=`

...
```

---

## Gebruikerservaring

| Actie | Resultaat |
|-------|-----------|
| Open handleiding | Titel + content in Markdown-stijl |
| Super Admin ziet | Potloodicoon rechtsboven |
| Klik op potlood | Textarea met volledige Markdown |
| Bewerk en klik Opslaan | Content wordt opgeslagen |
| Annuleren | Terug naar leesmodus |

---

## Bestanden die aangepast worden

| Bestand | Wijziging |
|---------|-----------|
| `package.json` | `react-markdown` dependency |
| Database migratie | Content key update + initiële Markdown |
| `src/pages/SeoBlog.tsx` | Nieuwe edit-modus + Markdown rendering |
| `src/index.css` | Prose styling voor Markdown |


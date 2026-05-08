## Plan: Stijl-opties toevoegen aan "AI afbeelding"

### Doel
Onder de "AI afbeelding" optie op `/seo-blog` (Blog Generatie) een nieuwe sectie "Stijl" toevoegen met 3 selecteerbare stijlen waarvan er steeds maar 1 geselecteerd kan zijn:
- Isometric flat illustration
- Cinematic 3D interface render
- Brutalist / Raw UI design

### Database wijziging
Nieuwe kolom `image_style` toevoegen aan tabel `blog_settings` (type `text`, nullable, default `null`). De waarden worden opgeslagen als korte slug:
- `isometric_flat`
- `cinematic_3d`
- `brutalist_raw`

### UI wijzigingen in `src/components/seo-blog/BlogGenerationForm.tsx`
1. `image_style` toevoegen aan `formData` state (type union van de 3 slugs of `''`).
2. Bij ophalen van settings (rond regel 131) en bij reset (rond regel 151) `image_style` meeladen / leegmaken.
3. In het AI-afbeelding blok (na de gradient-velden, vóór regel 708) een nieuwe sectie "Stijl" renderen met 3 klikbare kaartjes/knoppen in een grid, gestyled in dezelfde glassmorphism look als de bestaande `AI afbeelding`/`Foto Google Drive` toggle. Geselecteerde optie krijgt een lichtere achtergrond + witte border, niet-geselecteerde een subtiele border.
4. Klikken op een optie zet `formData.image_style` direct én roept `saveSettings({ image_style: <waarde> })` aan (zelfde patroon als de image_type toggle op regel 610-611), zodat het meteen in de database staat.

### Webhook payload
In de submit-handler (rond regel 297) bij `image_type === 'ai_image'` ook `image_style: formData.image_style` meesturen; bij `google_drive` leeg/weglaten (consistent met bestaande conditional-pattern).

### Validatie
`image_style` is **optioneel** — geen blokkering van de Start-knop. Als de gebruiker niets kiest blijft het leeg.

### Hook / types
`BlogSettings` interface in `src/hooks/useBlogSettings.ts` uitbreiden met `image_style: string | null`.

### Bestanden
| Bestand | Wijziging |
|---------|-----------|
| migratie | Kolom `image_style` toevoegen aan `blog_settings` |
| `src/hooks/useBlogSettings.ts` | `image_style` toevoegen aan interface |
| `src/components/seo-blog/BlogGenerationForm.tsx` | State, UI sectie met 3 opties, save bij klik, payload-veld |

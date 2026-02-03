
# Interne Link Toevoegen in SEO Blog Handleiding

## Wijziging
Voeg een klikbare link toe aan "SEO" in Deel 1, punt 1 van de handleiding.

**Bestand:** `src/pages/SeoBlog.tsx`

### Huidige code (regel 469):
```tsx
<p className="text-sm text-white/70">Zorg voor toegang tot de map <span className="text-blue-300">"SEO"</span> (beheerd door Tikt).</p>
```

### Nieuwe code:
```tsx
<p className="text-sm text-white/70">Zorg voor toegang tot de map <a href="https://drive.google.com/drive/folders/1u8PyUe6-ZntBG_EhuU_nnkv4YpoWjEst?hl=nl" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">"SEO"</a> (beheerd door Tikt).</p>
```

## Details
- De tekst "SEO" wordt een klikbare link naar de Google Drive map
- `target="_blank"` opent de link in een nieuw tabblad
- `rel="noopener noreferrer"` is toegevoegd voor veiligheid
- Hover-effect toegevoegd (`hover:text-blue-200`) voor betere UX
- Onderstreping (`underline`) maakt duidelijk dat het een link is


## HTML Preview verwijderen van Nieuwsbrief pagina

De volledige "HTML Preview" Card staat op regels 824–866 in `src/pages/Nieuwsbrief.tsx`. Dit is een losstaand blok direct na de twee-koloms grid, volledig te verwijderen inclusief de bijbehorende Download-knop logica.

**Wijziging:** Verwijder regels 824–866 (de `{/* Preview full width */}` Card met iframe, download-knop en lege staat).

Daarna kan ook de `handleDownload` functie en de `Download` lucide-import worden opgeschoond als die nergens anders gebruikt worden.



## Email Handtekening tile toevoegen aan standaard tile-volgorde

### Probleem
De standaard `tile_order` in `useDashboardSettings.ts` bevat **geen** `email-handtekening`. Nieuwe gebruikers (van elke rol) die nog geen aangepaste dashboard-instellingen hebben, krijgen de tile dus niet te zien.

In `Index.tsx` staat `email-handtekening` wel in de fallback-lijst, maar als er dashboard-instellingen worden aangemaakt via `useDashboardSettings`, wordt de kortere lijst zonder `email-handtekening` opgeslagen in de database -- waardoor de fallback in `Index.tsx` nooit wordt bereikt.

### Oplossing
Voeg `'email-handtekening'` toe aan de `DEFAULT_SETTINGS.tile_order` array in `useDashboardSettings.ts`.

### Technisch

**Bestand: `src/hooks/useDashboardSettings.ts`** (regel 45)
- Wijzig:
  ```
  tile_order: ['saved-hours', 'monday-planning', 'seo-blog', 'wordpress-alt-text', 'chatbot', 'copyright-branding'],
  ```
  naar:
  ```
  tile_order: ['saved-hours', 'monday-planning', 'seo-blog', 'wordpress-alt-text', 'chatbot', 'copyright-branding', 'email-handtekening'],
  ```

Dit zorgt ervoor dat bestaande gebruikers met opgeslagen instellingen niet worden beinvloed, maar nieuwe gebruikers automatisch de Email Handtekening tile zien. Bestaande gebruikers die de tile missen kunnen deze via de Admin Panel Tile Organizer toevoegen.


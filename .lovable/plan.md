

## Pagina URL's synchronisatie fixen

### Probleem
De `PageUrlForm` en `BlogGenerationForm` gebruiken elk een eigen instantie van `usePageUrlSettings`. Wanneer je de Spreadsheet ID of Grid ID wijzigt in de Pagina URL tab, wordt alleen de lokale state van die tab bijgewerkt. De Blog Generatie tab behoudt de oude waarden totdat de pagina volledig herladen wordt.

### Oplossing
De `usePageUrlSettings` hook wordt eenmalig aangeroepen in de parent component (`SeoBlog.tsx`) en doorgegeven als props aan beide child components. Zo delen ze dezelfde databron.

### Technische wijzigingen

**1. `src/pages/SeoBlog.tsx`**
- Import `usePageUrlSettings` toevoegen
- De hook aanroepen met `selectedCompany?.id`
- Het `settings` object en `reloadSettings` functie doorgeven als props aan zowel `PageUrlForm` als `BlogGenerationForm`

**2. `src/components/seo-blog/PageUrlForm.tsx`**
- Accepteer `pageUrlSettings` en `reloadPageUrlSettings` als props in plaats van de hook intern aan te roepen
- Verwijder de interne `usePageUrlSettings` import en aanroep
- Gebruik de doorgegeven props voor het laden en herladen van data

**3. `src/components/seo-blog/BlogGenerationForm.tsx`**
- Accepteer `pageUrlSettings` als prop in plaats van de hook intern aan te roepen
- Verwijder de interne `usePageUrlSettings` import en aanroep
- Gebruik de doorgegeven prop voor weergave en webhook payload

Hierdoor wordt de data op een centraal punt beheerd: elke wijziging in de Pagina URL tab werkt automatisch de waarden bij die de Blog Generatie tab toont.

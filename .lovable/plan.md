

# Verbeteringen bij bedrijf toevoegen

## Wat verandert er

1. **Bevestigingsdialoog sluit direct**: Na het bevestigen en voltooien van het aanmaakproces hoeft de gebruiker niet opnieuw op "Toevoegen" te klikken. De bevestigingsdialoog sluit automatisch en het nieuwe bedrijf wordt geselecteerd.
2. **WordPress URL's automatisch invullen**: Bij het aanmaken worden de `get_afbeelding_url` en `post_blog_url` velden in `blog_settings` automatisch ingevuld op basis van de opgegeven domeinnaam.

## Aanpak

### 1. Bug fix: dialoog sluit correct na bevestiging

De `onOpenChange` handler van de bevestigings-AlertDialog opent momenteel de invoerdialoog opnieuw wanneer deze sluit (`setIsDialogOpen(true)`). Dit wordt aangepast zodat bij sluiting na een succesvolle aanmaak de invoerdialoog niet opnieuw opent.

### 2. WordPress URL's automatisch genereren

In de edge function (`trigger-add-company-webhook`) worden bij het upserten van `blog_settings` twee extra velden meegegeven:

- `get_afbeelding_url`: `https://[domeinnaam]/wp-json/wp/v2/media`
- `post_blog_url`: `https://[domeinnaam]/wp-json/wp/v2/posts`

Dit gebeurt alleen als er een domeinnaam is opgegeven.

## Technische details

### CompanySelector.tsx

- De `onOpenChange` van de bevestigings-AlertDialog wordt aangepast: bij sluiting na het aanmaken (`!isCreating` en dialoog sluit) wordt `setIsDialogOpen` niet meer op `true` gezet. Alleen bij "Annuleren" (voordat het aanmaken is gestart) wordt de invoerdialoog heropend.

### trigger-add-company-webhook/index.ts

- Bij de `blog_settings` upsert worden `get_afbeelding_url` en `post_blog_url` toegevoegd, opgebouwd uit de `companyDomain` parameter:
  ```
  get_afbeelding_url: `https://${companyDomain}/wp-json/wp/v2/media`
  post_blog_url: `https://${companyDomain}/wp-json/wp/v2/posts`
  ```
- Alleen ingevuld als `companyDomain` niet leeg is.



## Situatie

Het vorige plan is al geaccepteerd en gedeeltelijk uitgevoerd, maar de verkeerde bestanden zijn bewerkt. De `EmailSignatureForm.tsx` is nog niet aangepast.

## Wat te doen

Alleen `src/components/email-signature/EmailSignatureForm.tsx` aanpassen om profielfoto URL en bedrijfslogo URL verplicht te maken.

### Aanpak

1. Lees de huidige `EmailSignatureForm.tsx` om de exacte structuur te begrijpen
2. Voeg `profile_photo_url` en `company_logo_url` toe aan het zod-schema als verplichte string-velden
3. Koppel de bestaande state-variabelen (`profilePhotoUrl`, `companyLogoUrl`) aan het form via `setValue`/`watch`
4. Toon foutmeldingen onder de input-velden
5. Submit-knop wordt automatisch geblokkeerd via `!isValid`

### Bestanden

| Bestand | Aanpassing |
|---|---|
| `src/components/email-signature/EmailSignatureForm.tsx` | URL-velden verplicht maken in zod-schema |

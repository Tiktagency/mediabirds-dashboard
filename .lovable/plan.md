
# Plan: Email Handtekening Dashboard Tile en Pagina

## Overzicht

Dit plan voegt een nieuwe "Email handtekening" functionaliteit toe aan het dashboard, inclusief een complete formulierpagina voor het genereren van professionele email handtekeningen met profielfoto upload.

## Componenten

### 1. Database Wijzigingen

**Nieuwe tabel: `email_signature_settings`**
| Kolom | Type | Verplicht | Beschrijving |
|-------|------|-----------|--------------|
| id | uuid | ja | Primary key |
| user_id | uuid | ja | FK naar auth.users |
| first_name | text | ja | Voornaam |
| last_name | text | ja | Achternaam |
| email | text | ja | Email adres |
| job_title | text | ja | Functie |
| website | text | nee | Website URL |
| socials | jsonb | nee | Array van social links |
| background_type | text | ja | 'gradient' of 'solid' |
| background_color | text | ja | Hex kleur of gradient |
| text_color | text | ja | Hex kleur voor tekst |
| profile_photo_url | text | ja | URL naar geüploade foto |
| created_at | timestamptz | ja | Aanmaakdatum |
| updated_at | timestamptz | ja | Laatste update |

**Storage bucket: `profile-photos`**
- Publieke bucket voor profielfoto's
- RLS policies voor upload door geauthenticeerde gebruikers

**Automation settings insert:**
- Nieuwe record voor 'email-handtekening' met display_name, description, impact_level

### 2. Frontend Bestanden

**Nieuwe bestanden:**

| Bestand | Beschrijving |
|---------|--------------|
| `src/pages/EmailSignature.tsx` | Pagina component (structuur zoals CopyrightBranding.tsx) |
| `src/components/email-signature/EmailSignatureForm.tsx` | Formulier met alle velden |
| `src/hooks/useEmailSignatureSettings.ts` | Hook voor laden/opslaan van instellingen |

### 3. Bestaande Bestanden Aanpassen

**`src/App.tsx`**
- Nieuwe route toevoegen: `/email-signature`

**`src/pages/Index.tsx`**
- Nieuwe entry in `tileConfigMap`:
```typescript
'email-handtekening': {
  to: '/email-signature',
  icon: Mail,
  variant: 'secondary',
  statusKey: 'email-handtekening',
}
```

## Formulier Specificaties

### Velden

| Veld | Type | Verplicht | Details |
|------|------|-----------|---------|
| Naam + Achternaam | 2x Input | Ja | Voornaam en Achternaam apart |
| Email | Input (email) | Ja | Validatie op email formaat |
| Functie | Input | Ja | Bijv. "Marketing Manager" |
| Website | Input (url) | Nee | Optionele website URL |
| Social(s) | Dynamic list | Nee | Meerdere social links toevoegen |
| Achtergrond kleur | Radio + ColorPicker | Ja | Keuze: Gradient of Standaard kleur |
| Tekst kleur | ColorPicker | Ja | Kleur voor alle tekst |
| Profielfoto | File upload | Ja | Upload naar Supabase Storage |

### UI Flow

```text
┌────────────────────────────────────────────────────────────┐
│ Email Handtekening                                          │
│ Genereer een professionele email handtekening               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Voornaam *          │  │ Achternaam *        │          │
│  │ [_______________]   │  │ [_______________]   │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Email *                                       │          │
│  │ [____________________________________]       │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Functie *                                     │          │
│  │ [____________________________________]       │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Website (optioneel)                           │          │
│  │ [____________________________________]       │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Social Links                    [+ Toevoegen] │          │
│  │ ┌──────────────────────────────────────────┐ │          │
│  │ │ LinkedIn: https://linkedin.com/in/... [X] │ │          │
│  │ └──────────────────────────────────────────┘ │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Achtergrond kleur *                           │          │
│  │ ○ Gradient    ● Standaard kleur               │          │
│  │ [Color Picker]                                │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Tekst kleur *                                 │          │
│  │ [Color Picker]                                │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ Profielfoto *                                 │          │
│  │ ┌────────────────────────────────┐           │          │
│  │ │  📷  Sleep of klik om te       │           │          │
│  │ │       uploaden                 │           │          │
│  │ └────────────────────────────────┘           │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │            [ Handtekening Genereren ]         │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Technische Details

### File Upload Flow

1. Gebruiker selecteert afbeelding
2. Client-side validatie (max 5MB, alleen jpg/png/webp)
3. Upload naar `profile-photos` bucket met unieke filename (user_id + timestamp)
4. Publieke URL opslaan in `email_signature_settings.profile_photo_url`

### Social Links Structuur

```typescript
interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'other';
  url: string;
}
// Opgeslagen als: socials: SocialLink[]
```

### Kleur Opties

**Gradient optie:**
- Twee kleurenpickers voor gradient start en eind
- Preview van gradient in real-time

**Standaard kleur optie:**
- Enkele kleurenpicker
- Solid background color

## Implementatie Volgorde

1. **Database migratie** - Tabel en storage bucket aanmaken
2. **Storage bucket RLS** - Policies voor veilige uploads
3. **Automation settings** - Record toevoegen voor tile metadata
4. **useEmailSignatureSettings hook** - Data management
5. **EmailSignatureForm component** - Formulier UI
6. **EmailSignature page** - Pagina wrapper
7. **App.tsx route** - Route registreren
8. **Index.tsx tile config** - Dashboard tile toevoegen

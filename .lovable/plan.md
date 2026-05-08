

# Plan: Profielfoto en Bedrijfslogo als URL Tekstvelden

## Overzicht

De huidige implementatie gebruikt een file upload voor de profielfoto. Dit wordt vervangen door twee tekstvelden waar gebruikers een geldige URL kunnen invoeren:
1. **Profielfoto** - URL naar de profielfoto
2. **Bedrijfslogo** - URL naar het bedrijfslogo (nieuw veld)

---

## Wijzigingen

### 1. Database: Nieuwe kolom toevoegen

**Migratie SQL:**
```sql
ALTER TABLE email_signature_settings 
ADD COLUMN company_logo_url TEXT;
```

Dit voegt een optioneel veld toe voor de bedrijfslogo URL.

---

### 2. Hook: Interface uitbreiden

**Bestand: `src/hooks/useEmailSignatureSettings.ts`**

Voeg `company_logo_url` toe aan de `EmailSignatureSettings` interface:

```typescript
export interface EmailSignatureSettings {
  // ... bestaande velden ...
  profile_photo_url: string | null;
  company_logo_url: string | null;  // Nieuw
  // ...
}
```

Update de `saveSettings` functie om `company_logo_url` mee te nemen in insert en update queries.

---

### 3. Formulier: Upload vervangen door URL velden

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

#### Te verwijderen:
- `fileInputRef` (useRef voor file input)
- `isUploading` state
- `handleFileSelect` functie
- `onUploadPhoto` prop
- De volledige file upload component (regels 547-590)

#### Te vervangen door:

Twee nieuwe URL tekstvelden binnen dezelfde Card:

```typescript
{/* Afbeeldingen */}
<Card className="bg-white/5 border-white/10">
  <CardContent className="pt-6 space-y-4">
    <div className="space-y-2">
      <Label htmlFor="profile_photo_url" className="text-white">
        Profielfoto (URL)
      </Label>
      <Input
        id="profile_photo_url"
        type="url"
        value={profilePhotoUrl || ''}
        onChange={(e) => setProfilePhotoUrl(e.target.value || null)}
        className="bg-white/10 border-white/20 text-white"
        placeholder="https://example.com/profielfoto.jpg"
      />
      {profilePhotoUrl && (
        <img 
          src={profilePhotoUrl} 
          alt="Preview" 
          className="w-12 h-12 rounded-full object-cover mt-2"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
    </div>

    <div className="space-y-2">
      <Label htmlFor="company_logo_url" className="text-white">
        Bedrijfslogo (URL)
      </Label>
      <Input
        id="company_logo_url"
        type="url"
        value={companyLogoUrl || ''}
        onChange={(e) => setCompanyLogoUrl(e.target.value || null)}
        className="bg-white/10 border-white/20 text-white"
        placeholder="https://example.com/logo.png"
      />
      {companyLogoUrl && (
        <img 
          src={companyLogoUrl} 
          alt="Logo Preview" 
          className="h-10 object-contain mt-2"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
    </div>
  </CardContent>
</Card>
```

#### Nieuwe state toevoegen:
```typescript
const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
```

#### Effect updaten voor selectedSignature:
```typescript
setCompanyLogoUrl(selectedSignature.company_logo_url);
```

#### Auto-save trigger uitbreiden:
```typescript
useEffect(() => {
  if (companyLogoUrl !== selectedSignature?.company_logo_url) {
    triggerAutoSave();
  }
}, [companyLogoUrl]);
```

#### signatureData uitbreiden:
```typescript
const signatureData = {
  // ... bestaande velden ...
  profile_photo_url: profilePhotoUrl,
  company_logo_url: companyLogoUrl,  // Nieuw
};
```

#### Validatie in onSubmit aanpassen:
Valideer beide URL's als ze zijn ingevuld:
```typescript
// Valideer foto URLs indien aanwezig
const urlsToValidate = [
  { url: profilePhotoUrl, name: 'profielfoto' },
  { url: companyLogoUrl, name: 'bedrijfslogo' },
].filter(item => item.url);

for (const { url, name } of urlsToValidate) {
  try {
    const img = new Image();
    img.src = url!;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(() => reject(new Error('timeout')), 5000);
    });
  } catch {
    setPhotoError(`De ${name} link is niet geldig of niet openbaar toegankelijk`);
    return;
  }
}
```

---

### 4. Props opschonen

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

Verwijder de `onUploadPhoto` prop uit de interface en het component.

**Bestand: `src/pages/EmailSignature.tsx`**

Verwijder de `onUploadPhoto={uploadProfilePhoto}` prop van `EmailSignatureForm`.

---

## Samenvatting

| Component | Wijziging |
|-----------|-----------|
| Database | Nieuwe kolom `company_logo_url` |
| `useEmailSignatureSettings.ts` | `company_logo_url` in interface en queries |
| `EmailSignatureForm.tsx` | File upload → 2 URL tekstvelden met preview |
| `EmailSignature.tsx` | `onUploadPhoto` prop verwijderen |

## Resultaat

- Twee tekstvelden: "Profielfoto (URL)" en "Bedrijfslogo (URL)"
- Kleine preview thumbnails onder elk veld wanneer een geldige URL is ingevoerd
- Validatie dat de URL's openbaar toegankelijk zijn voordat de handtekening wordt gegenereerd
- Beide velden zijn optioneel
- Auto-save werkt voor beide velden


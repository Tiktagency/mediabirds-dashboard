
# Plan: Profielfoto Verkleinen, Validatie & Webhook Koppeling

## Overzicht

Drie wijzigingen worden doorgevoerd:
1. Profielfoto upload vlak verkleinen
2. Validatie toevoegen om te controleren of de foto URL openbaar/bereikbaar is
3. Webhook koppeling voor "Handtekening genereren" knop

## Wijzigingen

### 1. Profielfoto Upload Vlak Verkleinen

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

Het huidige upload vlak heeft `p-8` padding en grote iconen. Dit wordt compacter gemaakt:

**Regels 408-433 - Upload container verkleinen:**
- Van: `p-8` padding
- Naar: `p-4` padding
- Foto preview: van `w-24 h-24` naar `w-16 h-16`
- Upload icoon: van `w-8 h-8` naar `w-6 h-6`
- Loader icoon: van `w-8 h-8` naar `w-6 h-6`

### 2. Foto URL Validatie

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

Nieuwe state en functie toevoegen om te checken of een foto URL openbaar bereikbaar is:

```typescript
const [photoError, setPhotoError] = useState<string | null>(null);

// Valideer of foto URL bereikbaar is
const validatePhotoUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
};
```

In de `onSubmit` functie wordt voor het versturen gecheckt of de foto URL geldig is:

```typescript
const onSubmit = async (data: FormData) => {
  // Valideer foto URL indien aanwezig
  if (profilePhotoUrl) {
    setPhotoError(null);
    const isValid = await validatePhotoUrl(profilePhotoUrl);
    if (!isValid) {
      setPhotoError('De profielfoto link is niet geldig of niet openbaar toegankelijk');
      return;
    }
  }
  // ... rest van submit logica
};
```

Foutmelding tonen onder het foto upload vlak:
```typescript
{photoError && (
  <p className="text-sm text-red-400">{photoError}</p>
)}
```

### 3. Webhook Koppeling

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

De `onSubmit` functie wordt uitgebreid om de data naar de webhook te sturen:

```typescript
const onSubmit = async (data: FormData) => {
  // Valideer foto URL
  if (profilePhotoUrl) {
    setPhotoError(null);
    try {
      const img = new Image();
      img.src = profilePhotoUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 5000); // 5 sec timeout
      });
    } catch {
      setPhotoError('De profielfoto link is niet geldig of niet openbaar toegankelijk');
      return;
    }
  }

  const signatureData = {
    name: data.name,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    job_title: data.job_title,
    website: data.website || null,
    background_type: data.background_type,
    background_color: data.background_color,
    gradient_end_color: data.background_type === 'gradient' ? data.gradient_end_color : null,
    text_color: data.text_color,
    socials,
    profile_photo_url: profilePhotoUrl,
  };

  // Stuur naar webhook
  try {
    const webhookResponse = await fetch(
      'https://tikt.app.n8n.cloud/webhook-test/0d19dda2-8df2-4952-a93a-5c9c49b4edd8',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signatureData),
      }
    );
    
    if (!webhookResponse.ok) {
      throw new Error('Webhook request failed');
    }
    
    // Optioneel: verwerk response van webhook
    const webhookData = await webhookResponse.text();
    console.log('Webhook response:', webhookData);
  } catch (error) {
    console.error('Error calling webhook:', error);
    // Toon foutmelding maar ga door met opslaan
  }

  // Sla ook op in database
  await onSave(signatureData);
};
```

## Samenvatting Wijzigingen

| Bestand | Wijziging |
|---------|-----------|
| `EmailSignatureForm.tsx` | Padding van `p-8` naar `p-4`, kleinere iconen en foto preview |
| `EmailSignatureForm.tsx` | Nieuwe `photoError` state en Image-based validatie |
| `EmailSignatureForm.tsx` | POST request naar n8n webhook bij submit |

## Webhook Payload

De webhook ontvangt alle formuliergegevens als JSON:

```json
{
  "name": "Werk Handtekening",
  "first_name": "Jan",
  "last_name": "Jansen",
  "email": "jan@bedrijf.nl",
  "job_title": "Marketing Manager",
  "website": "https://bedrijf.nl",
  "background_type": "gradient",
  "background_color": "#1a1a2e",
  "gradient_end_color": "#16213e",
  "text_color": "#ffffff",
  "socials": [
    { "platform": "linkedin", "url": "https://linkedin.com/in/janjansen" }
  ],
  "profile_photo_url": "https://..."
}
```

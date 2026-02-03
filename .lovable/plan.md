
# Plan: Handtekening Genereren met Save-melding bij Wijzigingen

## Doel
De "Handtekening genereren" knop moet:
1. POST request naar de webhook sturen (al aanwezig)
2. Gegevens opslaan en een pop-up melding tonen als er gegevens zijn veranderd

## Huidige situatie
De code slaat al automatisch op met `onSave(signatureData, { silent: true })`, maar:
- De `silent: true` optie onderdrukt alle meldingen
- Er wordt niet gecontroleerd of er daadwerkelijk wijzigingen zijn

## Oplossing
Gebruik react-hook-form's `formState.isDirty` om te detecteren of formuliergegevens zijn gewijzigd. Bij wijzigingen wordt een melding getoond, anders wordt stil opgeslagen.

## Wijzigingen

**Bestand:** `src/components/email-signature/EmailSignatureForm.tsx`

### 1. Voeg `isDirty` toe aan form destructuring (regel 88)

```tsx
const {
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  formState: { errors, isValid, isDirty },
} = useForm<FormData>({
```

### 2. Track ook wijzigingen in niet-form velden

Voeg state toe om wijzigingen in socials, foto URLs en extra velden te tracken:

```tsx
const [hasNonFormChanges, setHasNonFormChanges] = useState(false);
```

Met useEffect om wijzigingen te detecteren:

```tsx
useEffect(() => {
  if (!selectedSignature) {
    setHasNonFormChanges(true); // Nieuwe handtekening = altijd wijzigingen
    return;
  }
  
  const socialsChanged = JSON.stringify(socials) !== JSON.stringify(selectedSignature.socials);
  const photoChanged = profilePhotoUrl !== selectedSignature.profile_photo_url;
  const logoChanged = companyLogoUrl !== selectedSignature.company_logo_url;
  const extrasChanged = 
    JSON.stringify(extraEmails) !== JSON.stringify(selectedSignature.emails?.slice(1) || []) ||
    JSON.stringify(extraPhoneNumbers) !== JSON.stringify(selectedSignature.phone_numbers?.slice(1) || []) ||
    JSON.stringify(extraLocations) !== JSON.stringify(selectedSignature.locations?.slice(1) || []);
  
  setHasNonFormChanges(socialsChanged || photoChanged || logoChanged || extrasChanged);
}, [socials, profilePhotoUrl, companyLogoUrl, extraEmails, extraPhoneNumbers, extraLocations, selectedSignature]);
```

### 3. Pas save logica aan in onSubmit (regels 355-358)

```tsx
// Auto-save alle gegevens inclusief HTML
signatureData.generated_html = htmlCode;

const hasChanges = isDirty || hasNonFormChanges || !selectedSignature;

if (hasChanges) {
  // Wijzigingen gedetecteerd - opslaan MET melding
  await onSave(signatureData, { silent: false });
} else {
  // Geen wijzigingen - stil opslaan (alleen HTML update)
  await onSave(signatureData, { silent: true });
}
```

### 4. Reset dirty state na opslaan

Na succesvolle save, reset de form state:

```tsx
// Reset form dirty state na opslaan
reset(data, { keepValues: true });
setHasNonFormChanges(false);
```

## Resultaat

| Situatie | Gedrag |
|----------|--------|
| Nieuwe handtekening | Opslaan + melding "Je email handtekening is opgeslagen" |
| Bestaande handtekening met wijzigingen | Opslaan + melding "Je email handtekening is opgeslagen" |
| Bestaande handtekening zonder wijzigingen | Alleen HTML updaten, geen melding |

## Technische Details
- `isDirty` van react-hook-form trackt wijzigingen in form fields
- `hasNonFormChanges` trackt wijzigingen in socials, foto URLs en extra velden
- `reset(data, { keepValues: true })` reset de dirty state zonder waarden te wissen

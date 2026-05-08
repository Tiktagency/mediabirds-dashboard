
# Plan: Email Handtekening Verbeteringen

## Overzicht

Dit plan bevat twee onderdelen:
1. **Kleur preview uitlijning** - Het voorbeeldvlak van de achtergrondkleur wordt uitgelijnd en krijgt dezelfde hoogte als de kleurinput
2. **Meerdere handtekeningen beheren** - Gebruikers kunnen meerdere handtekeningen opslaan, bekijken en nieuwe toevoegen

## Deel 1: Kleur Preview Uitlijning

### Huidige Situatie
Het voorbeeldvlak (preview) voor de achtergrondkleur staat niet goed uitgelijnd met de kleurinput velden. De hoogte is anders en de verticale positie klopt niet.

### Oplossing
De layout wordt aangepast zodat:
- Het voorbeeldvlak exact dezelfde hoogte krijgt als de color input (`h-10` = 40px)
- Beide elementen verticaal gecentreerd worden via `items-end` op de container
- Het label "Voorbeeld" wordt toegevoegd boven de preview voor consistentie

### Wijzigingen in `EmailSignatureForm.tsx`

Huidige code (regels 304-329):
```tsx
<div className="flex items-center gap-4">
  <div className="space-y-2">
    <Label>...</Label>
    <Input type="color" className="w-16 h-10 ..." />
  </div>
  {backgroundType === 'gradient' && (...)}
  <div
    className="w-24 h-10 rounded-md border border-white/20"
    style={getBackgroundStyle()}
  />
</div>
```

Nieuwe code:
```tsx
<div className="flex items-end gap-4">
  <div className="space-y-2">
    <Label>Start kleur / Kleur</Label>
    <Input type="color" className="w-16 h-10 ..." />
  </div>
  {backgroundType === 'gradient' && (
    <div className="space-y-2">
      <Label>Eind kleur</Label>
      <Input type="color" className="w-16 h-10 ..." />
    </div>
  )}
  <div className="space-y-2">
    <Label>Voorbeeld</Label>
    <div
      className="w-24 h-10 rounded-md border border-white/20"
      style={getBackgroundStyle()}
    />
  </div>
</div>
```

## Deel 2: Meerdere Handtekeningen Beheren

### Database Aanpassing
De huidige tabel `email_signature_settings` ondersteunt al meerdere handtekeningen per gebruiker (geen unieke constraint op `user_id`). Er wordt een `name` kolom toegevoegd zodat gebruikers handtekeningen een herkenbare naam kunnen geven.

```sql
ALTER TABLE email_signature_settings 
ADD COLUMN name TEXT NOT NULL DEFAULT 'Mijn Handtekening';
```

### Nieuwe Componenten

#### 1. SignatureList Component
Een nieuw component dat alle opgeslagen handtekeningen van de gebruiker toont:
- Lijst met handtekening-kaarten (naam, email, preview)
- Klik om te bewerken
- Delete knop per handtekening
- "Nieuwe Handtekening" knop

#### 2. Aangepaste Hook
De `useEmailSignatureSettings` hook wordt uitgebreid:
- `fetchAllSignatures()` - Haalt alle handtekeningen op
- `signatures` - Array van alle handtekeningen
- `selectedSignature` - Huidige geselecteerde handtekening
- `selectSignature(id)` - Selecteer handtekening voor bewerking
- `deleteSignature(id)` - Verwijder een handtekening
- `createNewSignature()` - Start nieuwe handtekening

### Pagina Layout Wijziging
De `EmailSignature.tsx` pagina krijgt een twee-koloms layout:
- **Links**: Lijst met opgeslagen handtekeningen + "Nieuwe" knop
- **Rechts**: Het huidige formulier (voor bewerken of nieuwe aanmaken)

```text
┌─────────────────────────────────────────────────────────┐
│  Email Handtekening                                      │
├───────────────────────┬─────────────────────────────────┤
│  Mijn Handtekeningen  │  [Formulier]                    │
│  ┌─────────────────┐  │  Voornaam: Jan                  │
│  │ Jan Jansen      │◄─│  Achternaam: Jansen             │
│  │ jan@bedrijf.nl  │  │  Email: jan@bedrijf.nl          │
│  └─────────────────┘  │  ...                            │
│  ┌─────────────────┐  │                                 │
│  │ Marketing Team  │  │                                 │
│  │ marketing@...   │  │                                 │
│  └─────────────────┘  │                                 │
│  [+ Nieuwe]           │  [Opslaan]                      │
└───────────────────────┴─────────────────────────────────┘
```

## Te Wijzigen/Maken Bestanden

| Bestand | Actie | Beschrijving |
|---------|-------|--------------|
| `supabase/migrations/...` | Nieuw | Voeg `name` kolom toe |
| `src/hooks/useEmailSignatureSettings.ts` | Wijzigen | Uitbreiden voor meerdere handtekeningen |
| `src/components/email-signature/SignatureList.tsx` | Nieuw | Lijst component voor opgeslagen handtekeningen |
| `src/components/email-signature/EmailSignatureForm.tsx` | Wijzigen | Kleur preview uitlijning + name veld |
| `src/pages/EmailSignature.tsx` | Wijzigen | Twee-koloms layout met lijst en formulier |

## Implementatie Volgorde

1. Database migratie voor `name` kolom
2. Update hook met meerdere handtekeningen logica
3. Fix kleur preview uitlijning in formulier
4. Voeg `name` veld toe aan formulier
5. Maak SignatureList component
6. Update EmailSignature pagina met twee-koloms layout

## Technische Details

### Hook Interface (nieuw)
```typescript
interface UseEmailSignatureSettings {
  signatures: EmailSignatureSettings[];
  selectedSignature: EmailSignatureSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  selectSignature: (id: string | null) => void;
  saveSettings: (settings: ...) => Promise<void>;
  deleteSignature: (id: string) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string | null>;
}
```

### SignatureList Props
```typescript
interface SignatureListProps {
  signatures: EmailSignatureSettings[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}
```

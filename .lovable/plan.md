
# Plan: Email Handtekening Pagina Layout Aanpassen

## Overzicht

De pagina wordt uitgebreid met een nieuw paneel aan de rechterkant waar de gegenereerde HTML code van de handtekening komt te staan. Daarnaast wordt de knoptekst gewijzigd naar "Handtekening genereren".

## Visuele Layout

De nieuwe layout wordt een 3-koloms grid op desktop:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Email Handtekening                                │
│           Genereer een professionele email handtekening                  │
├──────────────┬──────────────────────────┬───────────────────────────────┤
│  Signature   │                          │                               │
│     List     │   Formulier              │   HTML Output                 │
│              │                          │                               │
│  [Sig 1]     │   [Naam, Email, etc.]    │   ┌─────────────────────────┐ │
│  [Sig 2]     │                          │   │                         │ │
│  [+ Nieuw]   │   [Kleuren]              │   │   <table>               │ │
│              │                          │   │     <tr>...             │ │
│              │   [Foto upload]          │   │   </table>              │ │
│              │                          │   │                         │ │
│              │   [Handtekening          │   └─────────────────────────┘ │
│              │    genereren]            │   [Kopieer HTML]              │
└──────────────┴──────────────────────────┴───────────────────────────────┘
```

## Wijzigingen

### 1. `src/pages/EmailSignature.tsx`

**Grid layout uitbreiden (regel 49):**
- Van: `grid-cols-1 lg:grid-cols-[300px_1fr]`
- Naar: `grid-cols-1 lg:grid-cols-[280px_1fr_1fr]`

**Nieuw HTML Output paneel toevoegen (na regel 68):**
```typescript
{/* Right: HTML Output */}
<div className="order-3">
  <Card className="bg-white/5 border-white/10 h-full">
    <CardHeader>
      <CardTitle className="text-white text-lg">HTML Code</CardTitle>
      <CardDescription className="text-white/50">
        Kopieer deze code naar je email programma
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/70 min-h-[300px] overflow-auto">
        {/* Leeg vlak voor HTML code */}
        <span className="text-white/30">
          Vul het formulier in en klik op "Handtekening genereren" 
          om de HTML code te zien.
        </span>
      </div>
    </CardContent>
  </Card>
</div>
```

**Imports uitbreiden (regel 2):**
```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
```

### 2. `src/components/email-signature/EmailSignatureForm.tsx`

**Knoptekst aanpassen (regels 448-452):**
- Van: `'Handtekening Bijwerken'` en `'Handtekening Opslaan'`
- Naar: `'Handtekening genereren'` (voor beide gevallen)

```typescript
<Button
  type="submit"
  disabled={isSaving}
  className="w-full bg-primary hover:bg-primary/90"
>
  {isSaving ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Genereren...
    </>
  ) : (
    'Handtekening genereren'
  )}
</Button>
```

### 3. Max-width aanpassen

Om ruimte te maken voor de derde kolom:
- Van: `max-w-5xl` (1024px)
- Naar: `max-w-7xl` (1280px)

## Resultaat

- Links: Lijst met opgeslagen handtekeningen (280px breed)
- Midden: Invulformulier (flex)
- Rechts: Leeg HTML output paneel (flex) - klaar voor toekomstige HTML generatie
- Knop heet nu "Handtekening genereren"
- Responsief: op mobiel stapelen de kolommen verticaal

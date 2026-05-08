
# Plan: Prullenbak op Nieuw Handtekening Slot

## Probleem

Het nieuwe "Nieuwe handtekening" placeholder slot heeft geen prullenbak-icoon, waardoor gebruikers niet intuïtief kunnen annuleren als ze toch geen nieuwe handtekening willen maken.

---

## Oplossing

Voeg een prullenbak-knop toe aan het nieuwe handtekening slot, identiek aan de bestaande handtekeningen. Bij klikken wordt de "nieuw" modus geannuleerd.

---

## Technische Wijzigingen

### 1. SignatureList aanpassen

**Nieuwe prop toevoegen:**
```typescript
interface SignatureListProps {
  // ... bestaande props
  onCancelNew: () => void;  // NIEUW
}
```

**Prullenbak toevoegen aan placeholder card:**
```typescript
{isCreatingNew && (
  <Card className="...">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Bestaande inhoud */}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-white/40 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
        onClick={onCancelNew}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </Card>
)}
```

### 2. Hook aanpassen (`useEmailSignatureSettings.ts`)

**Nieuwe functie toevoegen:**
```typescript
const cancelNewSignature = () => {
  setIsCreatingNew(false);
  // Selecteer eerste bestaande handtekening als die er is
  if (signatures.length > 0) {
    setSelectedSignature(signatures[0]);
  }
};
```

### 3. EmailSignature pagina updaten

**Nieuwe prop doorgeven:**
```typescript
<SignatureList
  // ... bestaande props
  onCancelNew={cancelNewSignature}
/>
```

---

## Resultaat

- Prullenbak-icoon verschijnt rechts op het nieuwe handtekening slot
- Klikken op prullenbak annuleert het aanmaken en selecteert de eerste bestaande handtekening (indien aanwezig)
- Consistent gedrag met bestaande handtekening cards

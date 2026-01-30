
# Plan: Visueel "Nieuw" Slot Tonen

## Probleem

Wanneer je op "+ Nieuw" klikt, wordt de huidige selectie gewist, maar er is geen visuele feedback in de lijst links dat er een nieuwe handtekening wordt aangemaakt.

---

## Oplossing

Voeg een visueel leeg slot toe aan de SignatureList wanneer de gebruiker op "+ Nieuw" klikt. Dit slot:
- Verschijnt bovenaan de lijst
- Is geselecteerd (met ring styling)
- Toont placeholder tekst zoals "Nieuwe handtekening"

---

## Technische Wijzigingen

### 1. Hook aanpassen (`src/hooks/useEmailSignatureSettings.ts`)

Voeg een `isCreatingNew` state toe:
```typescript
const [isCreatingNew, setIsCreatingNew] = useState(false);

const createNewSignature = () => {
  setSelectedSignature(null);
  setIsCreatingNew(true);  // Activeer "nieuw" modus
};

const selectSignature = (id: string | null) => {
  // ... bestaande logica
  setIsCreatingNew(false);  // Deactiveer bij selectie
};
```

Return `isCreatingNew` in de hook.

### 2. SignatureList uitbreiden (`src/components/email-signature/SignatureList.tsx`)

Voeg een `isCreatingNew` prop toe en toon een placeholder card:

```typescript
interface SignatureListProps {
  // ... bestaande props
  isCreatingNew: boolean;
}

// In de render:
{isCreatingNew && (
  <Card className="bg-white/5 border-white/10 p-4 ring-2 ring-primary border-primary">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <Plus className="w-5 h-5 text-white/50" />
      </div>
      <div>
        <p className="font-medium text-white">Nieuwe handtekening</p>
        <p className="text-sm text-white/50">Vul het formulier in</p>
      </div>
    </div>
  </Card>
)}
```

### 3. EmailSignature pagina updaten (`src/pages/EmailSignature.tsx`)

Pass de nieuwe prop door naar SignatureList:

```typescript
const { isCreatingNew, ... } = useEmailSignatureSettings();

<SignatureList
  signatures={signatures}
  selectedId={selectedSignature?.id || null}
  onSelect={selectSignature}
  onDelete={deleteSignature}
  isCreatingNew={isCreatingNew}
/>
```

---

## Visueel Resultaat

**Voor:**
- Klik op "+ Nieuw" → selectie verdwijnt, geen visuele feedback

**Na:**
- Klik op "+ Nieuw" → nieuw leeg slot verschijnt bovenaan met geselecteerde styling
- Klik op bestaande handtekening → nieuw slot verdwijnt, bestaande wordt geselecteerd

---

## Bestanden die worden aangepast

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/useEmailSignatureSettings.ts` | `isCreatingNew` state toevoegen |
| `src/components/email-signature/SignatureList.tsx` | Placeholder card renderen |
| `src/pages/EmailSignature.tsx` | Nieuwe prop doorgeven |


# Plan: Knopkleuren Toepassen in Hele Applicatie

## Probleem

De knopkleuren die in het Admin Panel worden ingesteld, werken alleen in de preview binnen het admin panel zelf. Knoppen zoals "Emailhandtekening genereren" op andere pagina's gebruiken nog steeds de standaard `bg-primary` kleur.

---

## Oplossing

Pas de opgeslagen knopkleuren toe via CSS variabelen die globaal worden ingesteld. Dit zorgt ervoor dat alle primaire knoppen in de applicatie automatisch de aangepaste kleuren gebruiken.

---

## Technische Aanpak

### 1. Nieuwe hook: `useApplyButtonColors`

Maak een hook die de knopkleuren uit dashboard settings haalt en als CSS variabelen toepast:

```typescript
// src/hooks/useApplyButtonColors.ts
export const useApplyButtonColors = () => {
  const { settings } = useDashboardSettings();
  
  useEffect(() => {
    const root = document.documentElement;
    const colors = settings?.button_colors;
    
    if (colors?.background) {
      root.style.setProperty('--button-primary-bg', colors.background);
    }
    if (colors?.text) {
      root.style.setProperty('--button-primary-text', colors.text);
    }
  }, [settings?.button_colors]);
};
```

### 2. Hook toepassen in App.tsx

Wrap de applicatie met een component dat de hook aanroept:

```typescript
const AppContent = () => {
  useApplyButtonColors();
  return (
    <Routes>
      {/* ... routes */}
    </Routes>
  );
};
```

### 3. CSS variabelen toevoegen aan index.css

Voeg default waarden en een custom class toe:

```css
:root {
  --button-primary-bg: #cfddd0;
  --button-primary-text: #002C1F;
}

.btn-primary-custom {
  background-color: var(--button-primary-bg) !important;
  color: var(--button-primary-text) !important;
}

.btn-primary-custom:hover {
  opacity: 0.9;
}
```

### 4. Button variant toevoegen

Voeg een "primaryCustom" variant toe aan de Button component die de CSS variabelen gebruikt:

```typescript
// In buttonVariants
primaryCustom: "bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:opacity-90",
```

### 5. Knoppen updaten

Pas de belangrijkste primaire knoppen aan om de custom variant te gebruiken:

**EmailSignatureForm.tsx:**
```tsx
<Button
  type="submit"
  variant="primaryCustom"  // Was: className="bg-primary hover:bg-primary/90"
  disabled={isSending || !isValid}
  className="w-full"
>
```

Andere pagina's met primaire actieknoppen worden ook bijgewerkt.

---

## Bestanden

| Bestand | Actie |
|---------|-------|
| `src/hooks/useApplyButtonColors.ts` | Nieuw - hook voor CSS variabelen |
| `src/App.tsx` | Hook integreren |
| `src/index.css` | CSS variabelen toevoegen |
| `src/components/ui/button.tsx` | `primaryCustom` variant toevoegen |
| `src/components/email-signature/EmailSignatureForm.tsx` | Button variant updaten |
| Andere pagina's met primaire knoppen | Button variant updaten |

---

## Resultaat

- Knopkleuren ingesteld in Admin Panel worden direct toegepast op alle primaire knoppen
- "Emailhandtekening genereren" en vergelijkbare knoppen krijgen automatisch de ingestelde kleuren
- Fallback naar default sage green (#cfddd0) als er geen custom kleuren zijn ingesteld

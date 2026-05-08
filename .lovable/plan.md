
## Probleem

In `handleColorChange` (regel 218-223 van `Nieuwsbrief.tsx`) wordt bij elke wijziging direct `saveToCompany` aangeroepen — zonder debounce. Bij gebruik van de color picker vuurt dit honderden saves per seconde, wat race conditions veroorzaakt: een latere Supabase-response (met tussenwaardes) kan de uiteindelijke kleur overschrijven. De laatste gekozen kleur wordt daardoor niet altijd correct opgeslagen.

## Oplossing

Debounce toevoegen aan `handleColorChange`: wacht 600ms na de laatste wijziging voordat opgeslagen wordt. Dit is hetzelfde patroon als de `useNewsletterSettings` hook al gebruikt.

### Implementatie

In `src/pages/Nieuwsbrief.tsx`:

1. `useRef` importeren (staat al) — voeg `useRef` toe aan de imports
2. Een `colorDebounceRef` aanmaken: `const colorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);`
3. `handleColorChange` aanpassen:

```typescript
const handleColorChange = (key: string, value: string) => {
  setLocalColors(prev => ({ ...prev, [key]: value }));
  if (!selectedCompany) return;
  if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
  colorDebounceRef.current = setTimeout(() => {
    saveToCompany({ [key]: value });
  }, 600);
};
```

### Bestand

| Bestand | Aanpassing |
|---|---|
| `src/pages/Nieuwsbrief.tsx` | `useRef` import uitbreiden, debounce ref toevoegen, `handleColorChange` aanpassen |

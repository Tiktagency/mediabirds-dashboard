
## Plan: Bedrijfsnaam auto-invullen + twee kolommen layout

### Wijziging 1: Bedrijfsnaam automatisch invullen
In `NewsletterCompanySelector.tsx`, bij het aanmaken van een nieuw bedrijf (`handleConfirmAdd`), de `bedrijfsnaam` direct mee-inserteren samen met `name`:

```typescript
// Nu:
.insert({ name: newCompanyName.trim() })

// Wordt:
.insert({ name: newCompanyName.trim(), bedrijfsnaam: newCompanyName.trim() })
```

En de `newCompany` object ook `bedrijfsnaam` meegeven zodat de form direct bijwerkt.

### Wijziging 2: Invulvelden in twee gelijke blokken naast elkaar
In `Nieuwsbrief.tsx` de 8 tekstvelden opsplitsen in twee blokken van 4 in een `grid grid-cols-2 gap-4`:

```
Kolom 1                    Kolom 2
──────────────────         ──────────────────
Bedrijfsnaam               Toon
Tagline                    CTA tekst
Bedrijfsomschrijving       CTA URL
Doelgroep                  Website
```

RSS feeds en kleuren blijven eronder op volledige breedte, of kleuren ook in twee kolommen (2×5).

### Bestanden
| Bestand | Aanpassing |
|---|---|
| `src/components/nieuwsbrief/NewsletterCompanySelector.tsx` | `bedrijfsnaam` meesturen bij insert |
| `src/pages/Nieuwsbrief.tsx` | Tekstvelden in `grid grid-cols-2 gap-4` layout |

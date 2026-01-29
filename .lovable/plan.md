

# Plan: Drie-Koloms Layout Herstellen

## Probleem

De drie-koloms layout (Handtekeningen lijst, Formulier, HTML Output) wordt momenteel pas weergegeven op `lg` schermen (1024px en breder). Op smallere schermen wordt alles onder elkaar getoond.

## Oplossing

Verlaag het breakpoint van `lg` naar `md` (768px) zodat de drie kolommen eerder naast elkaar worden weergegeven.

### Bestand: `src/pages/EmailSignature.tsx`

**Huidige code (regel 56):**
```typescript
<div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr_1fr] gap-6">
```

**Nieuwe code:**
```typescript
<div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[280px_1fr_1fr] gap-6">
```

### Order classes updaten

De order classes moeten ook van `lg:order-X` naar `md:order-X` worden gewijzigd:

**Regel 58 (Signature List):**
```typescript
<div className="order-2 lg:order-1">
```
Wordt:
```typescript
<div className="order-2 md:order-1">
```

**Regel 69 (Form):**
```typescript
<div className="order-1 lg:order-2">
```
Wordt:
```typescript
<div className="order-1 md:order-2">
```

## Samenvatting

| Wijziging | Van | Naar |
|-----------|-----|------|
| Grid breakpoint | `lg:grid-cols-[280px_1fr_1fr]` | `md:grid-cols-[280px_1fr_1fr]` |
| Signature List order | `lg:order-1` | `md:order-1` |
| Form order | `lg:order-2` | `md:order-2` |

## Resultaat

De drie kolommen worden nu weergegeven op schermen van 768px en breder, in plaats van alleen op 1024px+.



# Vergroten van Check en XCircle iconen in bewerkingsmodi

## Wat wordt er gedaan
De Check (✓) en XCircle (✗) iconen die verschijnen tijdens het bewerken van velden worden groter gemaakt zodat ze beter zichtbaar zijn.

## Huidige situatie
In `src/pages/SeoBlog.tsx` in het notities-veld (regels 368-409):
- Check icoon: `h-4 w-4` (klein, 16px)
- XCircle icoon: `h-4 w-4` (klein, 16px)

Deze zijn ook klein in `src/components/seo-blog/KeywordResearchForm.tsx`:
- Check icoon: `h-4 w-4` (regel 288)
- XCircle icoon: `h-4 w-4` (regel 296)

## Wijzigingen

### 1. SeoBlog.tsx (notities-vak)
- Regel 383: XCircle icoon vergroten van `h-4 w-4` naar `h-6 w-6`
- Regel 405: Check icoon vergroten van `h-4 w-4` naar `h-6 w-6`

### 2. KeywordResearchForm.tsx (formuliervelden)
- Regel 288: Check icoon vergroten van `h-4 w-4` naar `h-6 w-6`
- Regel 296: XCircle icoon vergroten van `h-4 w-4` naar `h-6 w-6`

## Visueel effect
De iconen worden ongeveer 50% groter (van 16px naar 24px), waardoor ze beter opvallen en gemakkelijker te klikken zijn.

## Betreffende bestanden
- `src/pages/SeoBlog.tsx` - 2 wijzigingen
- `src/components/seo-blog/KeywordResearchForm.tsx` - 2 wijzigingen

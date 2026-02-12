
# Bedrijfsnaam labeling consistency

## Wat verandert er

1. **KeywordResearchForm**: Het label "Bedrijf" wordt veranderd naar "Bedrijfsnaam" voor consistent labeling
2. **BlogGenerationForm**: Dit formulier heeft al "Bedrijfsnaam" staan, dus geen wijziging nodig
3. De `bedrijfsnaam` waarde wordt al automatisch gesynchroniseerd tussen de twee formulieren dankzij de eerdere wijzigingen in de edge function

## Aanpassingen

### KeywordResearchForm.tsx (1 kleine wijziging)

Op regel 468 wordt de label veranderd van:
```typescript
{renderInputField('Bedrijf', 'bedrijfsnaam', true)}
```

Naar:
```typescript
{renderInputField('Bedrijfsnaam', 'bedrijfsnaam', true)}
```

Dit zorgt voor consistent labeling met de BlogGenerationForm en maakt duidelijk dat dit hetzelfde veld is in beide tabbladen.

## Technische details

- Beide formulieren gebruiken nu dezelfde labeling ("Bedrijfsnaam")
- De `bedrijfsnaam` waarde wordt al automatisch gesynchroniseerd tussen `seo_settings` en `blog_settings` (vanuit eerdere wijzigingen)
- De edge function voegt de `bedrijfsnaam` al automatisch in bij het aanmaken van een bedrijf

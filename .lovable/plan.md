

## "URL's documenteren" per bedrijf onafhankelijk laten werken

### Wat verandert er
De laadstatus van de "URL's documenteren" knop wordt per bedrijf bijgehouden in plaats van als een enkele boolean. Hierdoor kun je voor bedrijf A op de knop drukken, wisselen naar bedrijf B, daar ook op de knop drukken, en beide processen draaien onafhankelijk van elkaar.

### Technische wijzigingen

**Bestand: `src/components/seo-blog/PageUrlForm.tsx`**

1. **State wijzigen** (regel 53): Vervang `const [isSubmitting, setIsSubmitting] = useState(false)` door `const [submittingCompanies, setSubmittingCompanies] = useState<Record<string, boolean>>({})`.

2. **Afgeleide waarde**: Voeg een constante toe: `const isSubmitting = selectedCompany ? submittingCompanies[selectedCompany.id] || false : false` zodat de rest van de component ongewijzigd kan blijven voor de UI-logica.

3. **`handleTriggerWebhook` functie aanpassen**: 
   - Aan het begin van de functie het `companyId` en `companyName` vastleggen in lokale variabelen (snapshot), zodat een bedrijfswissel tijdens het verwerken geen effect heeft.
   - `setSubmittingCompanies(prev => ({ ...prev, [companyId]: true }))` in plaats van `setIsSubmitting(true)`.
   - In het `finally` blok: `setSubmittingCompanies(prev => ({ ...prev, [companyId]: false }))` in plaats van `setIsSubmitting(false)`.
   - De vastgelegde `companyName` gebruiken in de payload in plaats van `selectedCompany.name`, zodat de juiste bedrijfsnaam wordt meegestuurd ongeacht de huidige selectie.


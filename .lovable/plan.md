

## Webhook response in toast + animatie-paneel hoogte gelijktrekken

### 1. Webhook response-bericht tonen in de pop-up melding

**Huidige situatie**: Na het aanroepen van de webhook toont de toast een hardcoded bericht ("Alt-tekst verwerking is gestart").

**Nieuwe situatie**: Het bericht dat de webhook terugstuurt (via `data` in de edge function response) wordt getoond in de toast. De toast verdwijnt na 5 seconden.

### 2. Animatie-paneel even hoog als de linker kolom

**Huidige situatie**: Het animatie-paneel rechts heeft een vaste breedte (`lg:w-72`) maar geen hoogte-afstemming met de linker kolom (invulvelden + Start-knop).

**Nieuwe situatie**: Het animatie-paneel strekt zich verticaal mee met de linker kolom door `items-stretch` te gebruiken op de flex-container, en het paneel `h-full` te geven.

### Aanpassingen

**`src/pages/WordpressAltText.tsx`**
- In `handleStart`: parse het `data`-veld uit de edge function response en gebruik dat als toast description
  - De edge function retourneert `{ success: true, data: "..." }` — het `data` veld bevat het webhook-antwoord
  - Probeer JSON te parsen voor een `message` of `Output` veld; gebruik anders de volledige tekst
- Stel de toast duration in op 5000ms (5 seconden)
- Wijzig de flex-container van `items-start` naar `items-stretch` zodat beide kolommen even hoog worden
- Geef het animatie-paneel `h-full` mee

**`src/components/wordpress-alt-text/AltTextAnimation.tsx`**
- Voeg `h-full` toe aan de buitenste container div zodat het paneel de volledige hoogte van de parent vult

**`src/hooks/use-toast.ts`**
- Wijzig `TOAST_REMOVE_DELAY` van 4000 naar 5000 (of gebruik een per-toast `duration` property als die beschikbaar is)

### Technische details

**Response parsing in handleStart:**
```typescript
const { data, error } = await supabase.functions.invoke('trigger-alt-text-webhook', {
  body: { bedrijfsnaam: selectedCompany.name, domain: selectedCompany.domain },
});
if (error) throw error;

// Parse webhook response message
let message = 'Alt-tekst verwerking is gestart';
try {
  const parsed = JSON.parse(data?.data || '{}');
  message = parsed.message || parsed.Output || data?.data || message;
} catch {
  message = data?.data || message;
}

toast({ title: 'Gestart', description: message });
```

**Layout stretch:**
```
items-start  -->  items-stretch
```
Dit zorgt ervoor dat het animatie-paneel rechts dezelfde hoogte krijgt als het blok met invulvelden + Start-knop links.


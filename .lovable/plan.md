

# "Laatste succesvol uitgevoerd" tonen bij Email Handtekening

## Probleem
De Email Handtekening tile toont geen "Laatste succesvol uitgevoerd" in de tooltip, omdat:
1. De `trigger-email-signature` edge function de `automation_status` tabel niet bijwerkt na een succesvolle generatie
2. De tooltip de sectie verbergt als er geen data is

## Oplossingen

### 1. Edge function aanpassen
**Bestand:** `supabase/functions/trigger-email-signature/index.ts`

Na een succesvolle webhook-aanroep, de `automation_status` tabel updaten met de huidige timestamp als `last_run`. Dit zorgt ervoor dat elke succesvolle handtekening-generatie wordt bijgehouden.

### 2. Tooltip altijd tonen
**Bestand:** `src/components/dashboard/AutomationInfoTooltip.tsx`

De "Laatste succesvol uitgevoerd" sectie altijd tonen, ook als er geen data is. In dat geval wordt "Nooit" weergegeven.

### 3. Database record aanmaken
Een initieel record aanmaken in de `automation_status` tabel voor `email-handtekening` zodat de data correct kan worden opgeslagen.

## Technische Details

### Edge function wijziging
Na een succesvolle webhook response (`result.ok === true`), een upsert uitvoeren op de `automation_status` tabel:

```typescript
// Na succesvolle webhook
if (result.ok) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  await supabaseClient
    .from('automation_status')
    .upsert({
      automation_name: 'email-handtekening',
      status: 'active',
      last_run: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'automation_name' });
}
```

### Tooltip wijziging
De conditie die de sectie verbergt aanpassen zodat het altijd getoond wordt wanneer de tooltip zichtbaar is:

```tsx
{/* Altijd tonen als er geen multipleLastRuns zijn */}
{!hasMultipleLastRunsData && (
  <div>
    <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
      Laatste succesvol uitgevoerd
    </p>
    <p className="text-sm text-white/80">
      {formatLastRun(lastRun) || 'Nooit'}
    </p>
  </div>
)}
```

### Database migratie
Insert van een initieel record zodat de edge function kan updaten:

```sql
INSERT INTO automation_status (automation_name, status, last_run)
VALUES ('email-handtekening', 'active', NULL)
ON CONFLICT (automation_name) DO NOTHING;
```

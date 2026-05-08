

# Plan: Auto-save zonder melding & Webhook via Edge Function

## Probleem Analyse

1. **Toast melding bij auto-save**: De `saveSettings` functie in `useEmailSignatureSettings.ts` toont altijd een "Opgeslagen" toast. Bij auto-save is dit ongewenst.

2. **Webhook CORS fout**: De browser blokkeert directe fetch naar `https://tikt.app.n8n.cloud/webhook-test/...` vanwege CORS. Dit moet via een backend edge function.

## Oplossing

### 1. Silent Auto-Save

**Bestand: `src/hooks/useEmailSignatureSettings.ts`**

Voeg een optionele `silent` parameter toe aan de `saveSettings` functie:

```typescript
const saveSettings = async (
  newSettings: Omit<EmailSignatureSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  options?: { silent?: boolean }
) => {
  // ... bestaande logica ...
  
  // Alleen toast tonen als niet silent
  if (!options?.silent) {
    toast({
      title: 'Opgeslagen',
      description: 'Je email handtekening is opgeslagen',
    });
  }
};
```

### 2. Edge Function voor Webhook

**Nieuw bestand: `supabase/functions/trigger-email-signature/index.ts`**

Maak een edge function die de webhook aanroept:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signatureData = await req.json();
    
    const webhookUrl = "https://tikt.app.n8n.cloud/webhook-test/0d19dda2-8df2-4952-a93a-5c9c49b4edd8";
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signatureData),
    });

    const responseText = await response.text();
    
    return new Response(
      JSON.stringify({ success: true, data: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 3. Form Aanpassen

**Bestand: `src/components/email-signature/EmailSignatureForm.tsx`**

**Auto-save met silent optie (regel 104):**
```typescript
await onSave({...}, { silent: true });
```

**Webhook via edge function aanroepen (regels 241-260):**
```typescript
const response = await supabase.functions.invoke('trigger-email-signature', {
  body: signatureData,
});

if (response.error) {
  throw new Error(response.error.message);
}

console.log('Webhook response:', response.data);
```

## Samenvatting Wijzigingen

| Bestand | Wijziging |
|---------|-----------|
| `useEmailSignatureSettings.ts` | `silent` parameter toevoegen aan `saveSettings` |
| `trigger-email-signature/index.ts` | Nieuwe edge function voor webhook proxy |
| `EmailSignatureForm.tsx` | Auto-save met `silent: true`, webhook via edge function |

## Resultaat

- Auto-save: Gegevens worden opgeslagen zonder melding
- Handtekening genereren: Stuurt data via edge function naar webhook (geen CORS probleem)
- Geen "Opgeslagen" melding meer bij klik op de knop


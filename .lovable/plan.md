

# Plan: Tijdelijk Wachtwoord Toevoegen aan Gebruikersuitnodigingen

## Huidige Situatie

De `invite-user` edge function maakt nieuwe gebruikers aan zonder wachtwoord en stuurt alleen een wachtwoord reset link naar de n8n webhook. Dit werd eerder als beveiligingsmaatregel geïmplementeerd.

## Gewenste Situatie

Bij het uitnodigen van een nieuwe gebruiker moet er ook een tijdelijk wachtwoord worden gegenereerd en meegestuurd naar de n8n webhook, zodat de uitnodigingsmail een werkend tijdelijk wachtwoord bevat.

## Beveiligingsoverweging

Het versturen van tijdelijke wachtwoorden via webhooks is minder veilig dan reset links, maar biedt betere gebruikerservaring. Om het risico te beperken:
- Genereer een sterk willekeurig wachtwoord (16+ karakters)
- Stuur het wachtwoord alleen via HTTPS naar de webhook
- Adviseer gebruikers om het wachtwoord direct te wijzigen na eerste login

## Wijzigingen

### `supabase/functions/invite-user/index.ts`

**Wijziging 1 - Wachtwoordgenerator functie toevoegen (na regel 36):**
```typescript
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const length = 16;
  let password = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }
  return password;
}
```

**Wijziging 2 - Gebruiker aanmaken met tijdelijk wachtwoord (regels 100-105):**
```typescript
// Generate temporary password
const tempPassword = generateTempPassword();

// Create user with temporary password
const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password: tempPassword,
  email_confirm: true,
});
```

**Wijziging 3 - Tijdelijk wachtwoord meesturen naar webhook (regels 143-155):**
```typescript
const webhookResponse = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    role,
    tempPassword, // Tijdelijk wachtwoord toevoegen
    resetLink: resetData?.properties?.action_link || null,
    dashboardUrl
  })
});
```

**Wijziging 4 - Succes bericht aanpassen (regel 162-167):**
```typescript
return new Response(JSON.stringify({ 
  success: true, 
  message: 'Gebruiker aangemaakt. Een uitnodiging met tijdelijk wachtwoord is verzonden.',
  resetLink: resetData?.properties?.action_link || null
}), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
```

## Webhook Payload (naar n8n)

Na de wijziging zal de n8n webhook de volgende data ontvangen:

```json
{
  "email": "gebruiker@voorbeeld.nl",
  "role": "viewer",
  "tempPassword": "AbC3$xYz!KmN9pQr",
  "resetLink": "https://...",
  "dashboardUrl": "https://audrvgrsuleruuspwnhf.lovableproject.com"
}
```

De n8n workflow kan deze data gebruiken om een uitnodigingsmail te versturen met:
- Het e-mailadres van de gebruiker
- Het tijdelijke wachtwoord
- De link naar het dashboard
- Instructies om het wachtwoord te wijzigen

## Resultaat

- Nieuwe gebruikers ontvangen een tijdelijk wachtwoord waarmee ze direct kunnen inloggen
- De reset link wordt ook nog steeds meegestuurd als backup optie
- De n8n workflow bepaalt welke informatie in de uitnodigingsmail komt


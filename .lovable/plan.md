

# Fix authenticatie delete-company webhook

## Probleem

De `trigger-delete-company-webhook` gebruikt `Authorization: Bearer ${authToken}`, maar de `trigger-blog-generation` function (de "Start" knop) gebruikt `Authorization: ${authToken}` -- zonder `Bearer` prefix. Hierdoor herkent n8n het verzoek niet.

## Oplossing

In `supabase/functions/trigger-delete-company-webhook/index.ts` op regel 29 wordt de Authorization header aangepast van:

```typescript
'Authorization': `Bearer ${authToken}`,
```

Naar:

```typescript
'Authorization': authToken,
```

Dit is exact hetzelfde formaat als in de `trigger-blog-generation` function, waar de token direct als header waarde wordt meegegeven zonder `Bearer` prefix.

Eén regelwijziging, geen andere bestanden betrokken.

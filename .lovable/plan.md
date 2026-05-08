
## Plan: Nieuwsbrief webhook — zelfde header authentication als blogs

### Analyse

Bij de blog webhook (`trigger-blog-generation`) wordt de Authorization header zo verstuurd:
```
'Authorization': authToken  // directe waarde, ZONDER 'Bearer ' prefix
```

De secret die gebruikt wordt is `BLOG_WEBHOOK_AUTH_TOKEN` (via `N8N_WEBHOOK_AUTH_TOKEN` als fallback).

Bij de nieuwsbrief webhook staat nu:
```
'Authorization': `Bearer ${authToken}`  // MET 'Bearer ' prefix
```
En de secret is `TIKT_WEBHOOK_AUTH_TOKEN`.

### Aanpassing

In `supabase/functions/trigger-newsletter-webhook/index.ts`:
1. Secret wijzigen van `TIKT_WEBHOOK_AUTH_TOKEN` naar `BLOG_WEBHOOK_AUTH_TOKEN`
2. Header waarde wijzigen van `` `Bearer ${authToken}` `` naar `authToken` (direct, zonder prefix)

### Bestand

| Bestand | Aanpassing |
|---|---|
| `supabase/functions/trigger-newsletter-webhook/index.ts` | `TIKT_WEBHOOK_AUTH_TOKEN` → `BLOG_WEBHOOK_AUTH_TOKEN`, `Bearer ${authToken}` → `authToken` |

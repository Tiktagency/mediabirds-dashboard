
## Verleng de wachttijd voor blog generatie

**Huidig probleem:**
- `trigger-blog-generation` edge function: AbortController op **180 seconden** (3 min) — maar een blog kan ook precies 3 min duren, wat een race condition geeft
- `supabase/config.toml`: `trigger-blog-generation` heeft **geen** `max_duration` instelling (standaard 150s)

**Twee wijzigingen, exact hetzelfde als bij de nieuwsbrief:**

**1. `supabase/functions/trigger-blog-generation/index.ts`** (regel 152)
- `180000` → `240000` (4 minuten AbortController timeout)
- Commentaar bijwerken: "180 second" → "240 second"

**2. `supabase/config.toml`** — voeg `max_duration = 300` toe aan de blog function:
```toml
[functions.trigger-blog-generation]
verify_jwt = false
max_duration = 300
```

Geen andere bestanden hoeven te wijzigen.

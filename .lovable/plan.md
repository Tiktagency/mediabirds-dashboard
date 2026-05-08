
Doel: de “Handtekening genereren”-knop moet aantoonbaar wél een POST doen met alle data, en jij moet direct feedback krijgen als n8n de webhook niet accepteert (nu faalt het stil/verwarrend).

Wat ik heb gevonden (uit de netwerk- en console-logs)
- De app verstuurt wel degelijk een request naar de backend-functie `trigger-email-signature` (status 200).
- Die backend-functie verstuurt vervolgens een POST naar jouw n8n URL.
- n8n antwoordt met:
  `{"code":404,"message":"This webhook is not registered for POST requests. Did you mean to make a GET request?"}`
- Dit is typisch voor n8n wanneer:
  - je de **/webhook-test/** URL gebruikt terwijl de workflow niet in “test listening” staat, of
  - de webhook-node niet op POST staat, of
  - je eigenlijk de **/webhook/** (productie) URL moet gebruiken (zoals bij je andere automatiseringen).

Waarom het “nog steeds niet werkt”
- De data wordt verstuurd, maar n8n weigert de POST op deze endpoint. Daarnaast retourneert onze backend-functie nu altijd `success: true` (ook als n8n faalt), waardoor het lijkt alsof alles goed ging.

Aanpak (simpel en zoals andere automatiseringen)

1) Backend-functie `trigger-email-signature` robuust maken (zoals trigger-blog/SEO)
Bestand: `supabase/functions/trigger-email-signature/index.ts`

Wijzigingen:
- Return niet altijd `success: true`. Gebruik:
  - `success: response.ok`
  - `status: response.status`
  - `rawText` (volledige response body)
- Voeg logging toe (alleen status/route, geen secrets) zodat we in de backend logs precies zien wat er gebeurt.
- Voeg optioneel een Authorization header toe, net als andere automations:
  - `Authorization: Deno.env.get('TIKT_WEBHOOK_AUTH_TOKEN') ?? Deno.env.get('N8N_WEBHOOK_AUTH_TOKEN')` (als aanwezig)
- Belangrijk: “kijk naar andere automatiseringen”
  - Andere automations gebruiken meestal `/webhook/` (niet `/webhook-test/`).
  - Ik implementeer daarom een “slimme fallback”:
    1) Eerst POST naar exact de door jou gegeven URL (`.../webhook-test/...`)
    2) Als n8n antwoordt met die “not registered for POST” boodschap of status 404:
       - automatisch nogmaals POST naar dezelfde URL maar dan met `webhook-test` vervangen door `webhook`.
    3) We geven terug welke URL uiteindelijk gebruikt is (`attemptedUrls` + `usedUrl`).

Resultaat:
- Als jouw n8n workflow actief is op productie-webhook, werkt het zonder dat jij iets hoeft aan te passen.
- Als je écht test-webhook wilt, blijft dat ook werken zodra n8n “listening for test” staat.

2) Frontend: toon duidelijke feedback (geen “het gebeurt niks” meer)
Bestand: `src/components/email-signature/EmailSignatureForm.tsx`

Wijzigingen:
- Voeg `useToast()` toe (zoals BlogGenerationForm) en toon een toast na klikken op “Handtekening genereren”:
  - Succes: toon (korte) succesmelding + eventueel response tekst.
  - Fout: toon foutmelding met de exacte n8n response (“not registered for POST…”) zodat meteen duidelijk is wat er misgaat.
- Verwerk de response van `supabase.functions.invoke('trigger-email-signature')` als:
  - `if (response.error)` => toast error
  - `else if (!response.data?.success)` => toast error met `status` + `rawText`
  - `else` => toast success
- Dit verandert niets aan auto-save: dat blijft stil en automatisch.

3) (Optioneel maar aanbevolen) UI: zet de volledige webhook response ook in het rechter “HTML Code” paneel
- Niet vereist voor de fix, maar dit maakt het debuggen/gebruik veel duidelijker (je ziet meteen wat n8n teruggeeft).
- Alleen als jij dit wilt; ik kan het direct meenemen.

Testplan (end-to-end)
1. Vul verplichte velden in → er mag géén “Opgeslagen” toast komen (auto-save is silent).
2. Klik “Handtekening genereren”:
   - Je moet direct een toast krijgen met succes of met de echte fout uit n8n.
3. Controleer dat n8n nu wél een run triggert:
   - Als het nog 404 is, dan ligt het aan n8n endpoint/methode; de UI zal dat nu expliciet tonen, en de fallback naar `/webhook/` vangt het meestal direct af.

Technisch (waarom dit dit oplost)
- We sturen al een POST, maar n8n weigert de endpoint. De echte fix is:
  1) correcte endpoint gebruiken (vaak `/webhook/` i.p.v. `/webhook-test/`), en/of
  2) correcte auth header meegeven, en
  3) het falen niet verbergen: success/status/response doorgeven en zichtbaar maken in de UI.

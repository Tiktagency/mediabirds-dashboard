## Probleem

`hello@tikt.ai` staat in de `profiles` tabel met `is_demo = true`. Hierdoor blokkeert de `is_demo_user()` functie alle automatisering-knoppen voor dit account.

Alleen `luc.degraag@student.hu.nl` hoort een demo-account te zijn (dit is hardcoded in `is_demo_user()` en `handle_new_user()`).

## Oplossing

Eén data-update uitvoeren op de `profiles` tabel:

```sql
UPDATE public.profiles
SET is_demo = false
WHERE id = '858fbdeb-e892-45ff-8d95-299063068e0c';
```

## Resultaat

- `hello@tikt.ai` → volledige toegang tot alle automatisering-knoppen (super_admin, geen demo)
- `luc.degraag@student.hu.nl` → blijft demo-account, knoppen blijven uitgeschakeld

Geen code- of schemawijzigingen nodig.
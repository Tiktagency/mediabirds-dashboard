
# Plan: Hello@tikt.ai naar Super Admin rol

## Huidige Situatie
- Account: `hello@tikt.ai`
- User ID: `858fbdeb-e892-45ff-8d95-299063068e0c`
- Huidige rol: `viewer`

## Gewenste Situatie
- Rol wijzigen naar: `super_admin`

## Benodigde Wijziging

**SQL Update voor user_roles tabel:**

```sql
UPDATE user_roles 
SET role = 'super_admin' 
WHERE user_id = '858fbdeb-e892-45ff-8d95-299063068e0c';
```

## Resultaat
Na deze wijziging heeft het account `hello@tikt.ai`:
- Volledige admin toegang tot het Admin panel
- Super admin rechten voor gebruikersbeheer
- Toegang tot alle edge functions die admin/super_admin controleren

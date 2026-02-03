
# Plan: RLS Policies voor Super Admin Toegang tot Companies

## Probleem
De RLS policies op de `companies` tabel controleren alleen op de `admin` rol. Als `super_admin` gebruiker kun je geen bedrijven zien of beheren.

## Huidige Policies
| Policy | Rol Check |
|--------|-----------|
| Admins can view companies | alleen `admin` |
| Admins can insert companies | alleen `admin` |
| Admins can update companies | alleen `admin` |
| Admins can delete companies | alleen `admin` |

## Oplossing
Alle vier de RLS policies updaten zodat zowel `admin` als `super_admin` bedrijven kunnen bekijken en beheren.

---

## Database Wijzigingen

```sql
-- Drop bestaande policies
DROP POLICY IF EXISTS "Admins can view companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

-- Nieuwe policies met super_admin ondersteuning
CREATE POLICY "Admins can view companies" ON companies
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can insert companies" ON companies
FOR INSERT TO public
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can update companies" ON companies
FOR UPDATE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete companies" ON companies
FOR DELETE TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
```

---

## Resultaat

| Actie | super_admin | admin | operator/viewer |
|-------|-------------|-------|-----------------|
| Bekijken | Ja | Ja | Nee |
| Toevoegen | Ja | Ja | Nee |
| Bewerken | Ja | Ja | Nee |
| Verwijderen | Ja | Ja | Nee |

Na deze wijziging zie je alle bedrijven weer in de CompanySelector op de SEO Blog pagina.

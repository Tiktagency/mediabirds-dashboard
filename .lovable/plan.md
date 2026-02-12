
# Voornaam en achternaam toevoegen aan gebruikersprofiel

## Wat verandert er

Wanneer een uitgenodigde gebruiker voor het eerst inlogt en nog geen voornaam/achternaam heeft ingevuld, verschijnt er een verplicht formulier om deze gegevens in te vullen. De naam is daarna zichtbaar en bewerkbaar in het profielvenster.

## Wijzigingen

### 1. Database migratie

Twee kolommen toevoegen aan de `profiles` tabel:
- `first_name` (text, nullable, default null)
- `last_name` (text, nullable, default null)

RLS policy toevoegen zodat gebruikers hun eigen profiel kunnen updaten:
- `Users can update own profile` - UPDATE waar `auth.uid() = id`

### 2. Nieuw component: `CompleteProfileModal.tsx`

Een verplicht dialoogvenster dat verschijnt na inloggen als `first_name` of `last_name` leeg is in de `profiles` tabel.

- Twee velden: Voornaam en Achternaam (beide verplicht)
- Kan niet worden gesloten zonder de velden in te vullen
- Na opslaan wordt het profiel bijgewerkt in de database

### 3. Login pagina (`src/pages/Login.tsx`)

Na succesvol inloggen:
- Het profiel ophalen uit de `profiles` tabel
- Controleren of `first_name` en `last_name` zijn ingevuld
- Indien niet: de CompleteProfileModal tonen in plaats van direct naar het dashboard te navigeren

### 4. Profiel modal (`src/components/ProfileModal.tsx`)

- Voornaam en achternaam ophalen uit de `profiles` tabel bij openen
- Voornaam en achternaam tonen als bewerkbare velden (boven het e-mailadres)
- Opslaan-knop voor naamwijzigingen toevoegen

### 5. Index/Dashboard pagina

- Na inloggen controleren of het profiel compleet is
- Indien niet: CompleteProfileModal tonen als overlay

## Technische details

- De `profiles` tabel heeft al een `id` die overeenkomt met `auth.users.id`
- De `handle_new_user` trigger maakt al automatisch een profiel aan bij registratie
- Er is al een RLS policy voor SELECT (eigen profiel bekijken), maar UPDATE ontbreekt -- die wordt toegevoegd
- Het `CompleteProfileModal` gebruikt `closable={false}` zodat het niet weggeklikt kan worden

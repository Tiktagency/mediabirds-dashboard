## Wachtwoord wijzigen naar AfstuDeErProJect!

### Doel
Het wachtwoord van het account **luc.degraag@student.hu.nl** bijwerken naar **AfstuDeErProJect!**.

### Stappen
1. **Tijdelijke edge function aanmaken** (`temp-update-password`) met service role key om wachtwoord te kunnen bijwerken.
2. **Wachtwoord bijwerken** via de edge function voor het opgegeven e-mailadres.
3. **Edge function opruimen** om beveiligingsrisico's te voorkomen.

### Technische details
- Gebruik `supabaseAdmin.auth.admin.updateUserById()` om het wachtwoord te zetten.
- De gebruiker moet na de wijziging kunnen inloggen met het nieuwe wachtwoord.
- Oude wachtwoord (`Tikt975Takt!`) wordt hiermee vervangen en werkt niet meer.

### Resultaat
- Login werkt alleen nog met `luc.degraag@student.hu.nl` + `AfstuDeErProJect!`


## Layout aanpassen: twee onderste vakken uitlijnen en gelijk breed maken

### Wat verandert er

De twee onderste vakken (het formulier met bedrijfsvelden + de animatie) worden even breed gemaakt en uitgelijnd met het "Automatische trigger" vak erboven.

### Technische aanpassing

**Bestand: `src/pages/Landingspagina.tsx`**

**Regel 217 - Container**: Behoud `max-w-2xl w-full` (is al gelijk aan de trigger).

**Regel 219 - Linker kolom**: Verander van `flex-1 w-full` naar `flex-1 min-w-0` zodat beide kolommen gelijk delen.

**Regel 330 - Rechter kolom (animatie)**: Verander van `hidden lg:flex lg:w-72 flex-shrink-0` naar `hidden lg:flex flex-1 min-w-0` zodat deze dezelfde breedte krijgt als de linker kolom.

| Regel | Was | Wordt |
|---|---|---|
| 219 | `flex-1 w-full space-y-4` | `flex-1 min-w-0 space-y-4` |
| 330 | `hidden lg:flex lg:w-72 flex-shrink-0 flex-col` | `hidden lg:flex flex-1 min-w-0 flex-col` |

Hierdoor krijgen beide kolommen exact 50% van de beschikbare breedte binnen de `max-w-2xl` container, en staan ze netjes uitgelijnd onder het trigger-vak.


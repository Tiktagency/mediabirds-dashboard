

## Webhook URLs en Categorie verwijderen uit AutomationCard

### Wat wordt er aangepast

In het admin paneel onder "Automatisering-instellingen" worden twee secties verwijderd uit elke automation card:

1. **Webhook URLs sectie** (Primaire Webhook URL + Backup Webhook URL) — deze staan al in de backend
2. **Categorie dropdown** — zowel in het bewerkformulier als de badge in de header

### Bestand

| Bestand | Aanpassing |
|---|---|
| `src/components/admin/automation/AutomationCard.tsx` | Webhook URLs sectie verwijderen (regels 207-232), Categorie select verwijderen (regels 115-131), Categorie badge uit header verwijderen (regel 96-98), categorie uit save payload verwijderen |

### Wat blijft behouden

- Weergavenaam
- Beschrijving
- Impact Level (met badge in header)
- Status toggle
- Tijdsbesparing per execution
- N8N Workflow Naam


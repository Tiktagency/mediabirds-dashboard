
## Twee wijzigingen

### 1. Hoofdletter "Nieuwsbrief" in display_name
De tile toont nu "nieuwsbrief" omdat er geen `automation_settings` rij bestaat — het valt terug op de raw `automation_name` key. Een nieuwe rij toevoegen met `display_name: 'Nieuwsbrief'`.

### 2. Info-symbool
Het info-symbool werkt al voor alle tiles via `AutomationInfoTooltip` in `DashboardButton`. Het tooltip heeft geen data omdat de `automation_settings` rij ontbreekt → `description` is leeg en `impact` is 'medium' als fallback. Met een correcte rij in de database verschijnen description en impact in het tooltip.

### Database
Insert een rij in `automation_settings`:
```sql
INSERT INTO automation_settings (automation_name, display_name, description, impact_level, status)
VALUES ('nieuwsbrief', 'Nieuwsbrief', 'Genereer automatisch een nieuwsbrief op basis van RSS feeds en bedrijfsinformatie', 'medium', 'active')
ON CONFLICT (automation_name) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
```

Geen code-wijzigingen nodig — de tile pikt de nieuwe settings automatisch op via `useAutomationSettings`.

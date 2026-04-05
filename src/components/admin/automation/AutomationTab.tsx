import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { AutomationCard } from './AutomationCard';
import { Skeleton } from '@/components/ui/skeleton';

export const AutomationTab = () => {
  const { settings, isLoading, updateSetting } = useAutomationSettings();
  const { settings: dashboardSettings } = useDashboardSettings();

  const impactColors = dashboardSettings.impact_colors || {
    high: '#ef4444',
    medium: '#eab308',
    low: '#6b7280',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Automatisering-instellingen</h3>
        <p className="text-sm text-muted-foreground">
          Beheer instellingen voor elke automation: naam, impact level, status en webhooks.
        </p>
      </div>

      <div className="grid gap-4">
        {settings.map(setting => (
          <AutomationCard 
            key={setting.id} 
            setting={setting} 
            onUpdate={updateSetting}
            impactColors={impactColors}
          />
        ))}
      </div>

      {settings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Geen automations gevonden.
        </div>
      )}
    </div>
  );
};

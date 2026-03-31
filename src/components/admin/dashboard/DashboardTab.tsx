import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { TileOrganizer } from './TileOrganizer';
import { ColorCustomizer } from './ColorCustomizer';
import { ThemeSwitch } from './ThemeSwitch';
import { TooltipEditor } from './TooltipEditor';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardTab = () => {
  const { 
    settings, 
    isLoading, 
    updateTileOrder, 
    updateCustomLabel,
    updateCustomTooltip, 
    updateImpactColors, 
    updateTheme 
  } = useDashboardSettings();
  const { settings: automations } = useAutomationSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Dashboard Instellingen</h3>
        <p className="text-sm text-muted-foreground">
          Pas de volgorde, kleuren en teksten van je dashboard aan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TileOrganizer 
          tileOrder={settings.tile_order}
          automations={automations}
          customLabels={settings.custom_labels}
          onReorder={updateTileOrder}
          onUpdateLabel={updateCustomLabel}
        />
        
        <div className="space-y-6">
          <ThemeSwitch 
            theme={settings.theme} 
            onUpdate={updateTheme} 
          />
          <ColorCustomizer 
            colors={settings.impact_colors}
            onUpdate={updateImpactColors}
          />
        </div>
      </div>

      <TooltipEditor
        automations={automations}
        customTooltips={settings.custom_tooltips}
        onUpdate={updateCustomTooltip}
      />
    </div>
  );
};

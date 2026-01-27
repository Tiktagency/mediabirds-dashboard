import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { TileOrganizer } from './TileOrganizer';
import { ColorCustomizer } from './ColorCustomizer';
import { TileColorCustomizer } from './TileColorCustomizer';
import { ThemeSwitch } from './ThemeSwitch';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardTab = () => {
  const { 
    settings, 
    isLoading, 
    updateTileOrder, 
    updateCustomLabel,
    updateImpactColors,
    updateTileColors,
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
          Pas de volgorde en kleuren van je dashboard aan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TileOrganizer 
          tileOrder={settings.tile_order}
          automations={automations}
          customLabels={settings.custom_labels}
          tileColors={settings.tile_colors}
          onReorder={updateTileOrder}
          onUpdateLabel={updateCustomLabel}
        />
        
        <div className="space-y-6">
          <ThemeSwitch 
            theme={settings.theme} 
            onUpdate={updateTheme} 
          />
          <TileColorCustomizer 
            colors={settings.tile_colors}
            onUpdate={updateTileColors}
          />
          <ColorCustomizer 
            colors={settings.impact_colors}
            onUpdate={updateImpactColors}
          />
        </div>
      </div>
    </div>
  );
};

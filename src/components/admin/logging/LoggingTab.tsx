import { useLogSettings } from '@/hooks/useLogSettings';
import { LogSettingsForm } from './LogSettingsForm';
import { AlertConfiguration } from './AlertConfiguration';
import { LogViewer } from './LogViewer';
import { Skeleton } from '@/components/ui/skeleton';

export const LoggingTab = () => {
  const { settings, logs, isLoading, updateSettings, fetchLogs, exportLogs } = useLogSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Logging & Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Configureer log levels, retention en alerts voor automation monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogSettingsForm settings={settings} onUpdate={updateSettings} />
        <AlertConfiguration settings={settings} onUpdate={updateSettings} />
      </div>

      <LogViewer 
        logs={logs} 
        onFilter={fetchLogs}
        onExport={exportLogs}
      />
    </div>
  );
};

import { useLogSettings } from '@/hooks/useLogSettings';
import { AlertConfiguration } from './AlertConfiguration';
import { LogViewer } from './LogViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LogViewerSkeleton = () => (
  <Card className="bg-card/50 border-border/30">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[280px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <Skeleton className="h-[500px] w-full" />
    </CardContent>
  </Card>
);

export const LoggingTab = () => {
  const { settings, logs, allAutomationNames, isLoading, isRefreshing, updateSettings, fetchLogs, exportLogs } = useLogSettings();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Logging & Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Configureer alerts voor automation monitoring.
        </p>
      </div>

      {/* AlertConfiguration loads immediately with settings */}
      <AlertConfiguration settings={settings} onUpdate={updateSettings} />

      {/* LogViewer has its own loading state */}
      {isLoading && logs.length === 0 ? (
        <LogViewerSkeleton />
      ) : (
        <LogViewer 
          logs={logs}
          allAutomationNames={allAutomationNames}
          isRefreshing={isRefreshing}
          onFilter={fetchLogs}
          onExport={exportLogs}
        />
      )}
    </div>
  );
};

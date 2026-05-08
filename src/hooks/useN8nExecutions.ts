import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Batch hook: fetch multiple workflow last-runs in a single edge function call
export const useN8nExecutionsBatch = (workflowNames: string[]) => {
  const [lastRuns, setLastRuns] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workflowNames.length) return;

    const fetchExecutions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-n8n-executions', {
          body: { workflowNames },
        });

        if (error) {
          console.error('Error fetching n8n executions:', error);
          return;
        }

        if (data?.results) {
          const runs: Record<string, string | null> = {};
          for (const result of data.results) {
            runs[result.workflowName] = result.lastRun;
          }
          setLastRuns(runs);
        }
      } catch (error) {
        console.error('Error in useN8nExecutionsBatch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowNames.join(',')]);

  return { lastRuns, isLoading };
};

// Legacy single-workflow hook for backwards compatibility
export const useN8nExecutions = (workflowName: string | undefined) => {
  const names = workflowName ? [workflowName] : [];
  const { lastRuns, isLoading } = useN8nExecutionsBatch(names);
  return { lastRun: workflowName ? (lastRuns[workflowName] ?? null) : null, isLoading };
};

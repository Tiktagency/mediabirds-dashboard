import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExecutionData {
  workflowId: string;
  workflowName: string;
  lastRun: string | null;
  executionId: string | null;
}

export const useN8nExecutions = (workflowName: string | undefined) => {
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workflowName) return;

    const fetchExecution = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-n8n-executions', {
          body: { workflowName },
        });

        if (error) {
          console.error('Error fetching n8n execution:', error);
          return;
        }

        if (data?.lastRun) {
          setLastRun(data.lastRun);
        }
      } catch (error) {
        console.error('Error in useN8nExecutions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecution();

    // Refresh every 5 minutes
    const interval = setInterval(fetchExecution, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [workflowName]);

  return { lastRun, isLoading };
};

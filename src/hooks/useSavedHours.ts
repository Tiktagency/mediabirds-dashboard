import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSavedHours = (workflowNames: string[]) => {
  const [totalHours, setTotalHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedHours = async () => {
      if (!workflowNames || workflowNames.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('get-saved-hours', {
          body: { workflowNames },
        });

        if (fnError) {
          console.error('Error fetching saved hours:', fnError);
          setError(fnError.message);
          return;
        }

        setTotalHours(data?.totalHours || 0);
      } catch (err) {
        console.error('Error in useSavedHours:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedHours();
  }, [JSON.stringify(workflowNames)]);

  return { totalHours, isLoading, error };
};

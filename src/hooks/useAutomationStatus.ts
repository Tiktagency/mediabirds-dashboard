import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AutomationStatus = 'active' | 'running' | 'inactive';

export interface AutomationStatusData {
  automation_name: string;
  status: AutomationStatus;
  last_updated: string;
  last_run: string | null;
}

export const useAutomationStatus = (automationName?: string) => {
  const [statuses, setStatuses] = useState<Record<string, AutomationStatus>>({});
  const [lastRuns, setLastRuns] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const query = supabase
          .from('automation_status')
          .select('*');
        
        if (automationName) {
          query.eq('automation_name', automationName);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching automation statuses:', error);
          return;
        }
        
        if (data) {
          const statusMap: Record<string, AutomationStatus> = {};
          const lastRunMap: Record<string, string | null> = {};
          data.forEach((item) => {
            statusMap[item.automation_name] = item.status as AutomationStatus;
            lastRunMap[item.automation_name] = item.last_run;
          });
          setStatuses(statusMap);
          setLastRuns(lastRunMap);
        }
      } catch (error) {
        console.error('Error in fetchStatuses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('automation-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_status',
          ...(automationName && { filter: `automation_name=eq.${automationName}` })
        },
        (payload) => {
          console.log('Automation status changed:', payload);
          
          if (payload.eventType === 'DELETE') {
            setStatuses(prev => {
              const newStatuses = { ...prev };
              delete newStatuses[(payload.old as any).automation_name];
              return newStatuses;
            });
            setLastRuns(prev => {
              const newLastRuns = { ...prev };
              delete newLastRuns[(payload.old as any).automation_name];
              return newLastRuns;
            });
          } else {
            const data = payload.new as any;
            setStatuses(prev => ({
              ...prev,
              [data.automation_name]: data.status as AutomationStatus
            }));
            setLastRuns(prev => ({
              ...prev,
              [data.automation_name]: data.last_run
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [automationName]);

  return { statuses, lastRuns, isLoading };
};

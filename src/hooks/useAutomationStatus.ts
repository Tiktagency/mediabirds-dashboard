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
          data.forEach((item) => {
            statusMap[item.automation_name] = item.status as AutomationStatus;
          });
          setStatuses(statusMap);
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
          } else {
            const data = payload.new as any;
            setStatuses(prev => ({
              ...prev,
              [data.automation_name]: data.status as AutomationStatus
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [automationName]);

  return { statuses, isLoading };
};

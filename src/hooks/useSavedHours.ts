import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'saved_hours_cache';

export interface WorkflowBreakdown {
  executions: number;
  minutesSaved: number;
}

export interface CompanyBreakdown {
  totalMinutes: number;
  totalHours: number;
  workflows: Record<string, WorkflowBreakdown>;
}

export interface SavedHoursData {
  totalHours: number;
  totalMinutes: number;
  executionCount: number;
  periodStart: string;
  periodEnd: string;
  breakdownByCompany: Record<string, CompanyBreakdown>;
}

interface CacheData {
  data: SavedHoursData;
  timestamp: number;
}

const defaultData: SavedHoursData = {
  totalHours: 0,
  totalMinutes: 0,
  executionCount: 0,
  periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  periodEnd: new Date().toISOString(),
  breakdownByCompany: {},
};

export const useSavedHours = () => {
  // Initialize with cached value for instant display
  const getCachedValue = (): SavedHoursData => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp }: CacheData = JSON.parse(cached);
        // Use cache if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          return data;
        }
      }
    } catch {
      // Ignore cache errors
    }
    return defaultData;
  };

  const [data, setData] = useState<SavedHoursData>(getCachedValue);
  const [isLoading, setIsLoading] = useState(getCachedValue().totalHours === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedHours = async () => {
      try {
        setError(null);

        const { data: responseData, error: fnError } = await supabase.functions.invoke('get-saved-hours');

        if (fnError) {
          console.error('Error fetching saved hours:', fnError);
          setError(fnError.message);
          return;
        }

        const newData: SavedHoursData = {
          totalHours: responseData?.totalHours || 0,
          totalMinutes: responseData?.totalMinutes || 0,
          executionCount: responseData?.executionCount || 0,
          periodStart: responseData?.periodStart || defaultData.periodStart,
          periodEnd: responseData?.periodEnd || defaultData.periodEnd,
          breakdownByCompany: responseData?.breakdownByCompany || {},
        };
        
        setData(newData);
        
        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: newData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error in useSavedHours:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedHours();
  }, []);

  return { 
    totalHours: data.totalHours,
    totalMinutes: data.totalMinutes,
    executionCount: data.executionCount,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    breakdownByCompany: data.breakdownByCompany,
    isLoading, 
    error 
  };
};

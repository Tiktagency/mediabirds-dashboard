import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'saved_hours_cache';

export const useSavedHours = () => {
  // Initialize with cached value for instant display
  const getCachedValue = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { hours, timestamp } = JSON.parse(cached);
        // Use cache if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          return hours;
        }
      }
    } catch {
      // Ignore cache errors
    }
    return 0;
  };

  const [totalHours, setTotalHours] = useState<number>(getCachedValue);
  const [isLoading, setIsLoading] = useState(getCachedValue() === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedHours = async () => {
      try {
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('get-saved-hours');

        if (fnError) {
          console.error('Error fetching saved hours:', fnError);
          setError(fnError.message);
          return;
        }

        const hours = data?.totalHours || 0;
        setTotalHours(hours);
        
        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          hours,
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

  return { totalHours, isLoading, error };
};

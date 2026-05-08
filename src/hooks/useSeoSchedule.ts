import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SeoSchedule {
  id: string;
  company_id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  time_of_day: string; // HH:MM:SS format
  last_triggered_at: string | null;
  next_trigger_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateScheduleData {
  enabled?: boolean;
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  day_of_week?: number;
  time_of_day?: string;
  next_trigger_at?: string;
}

const calculateNextTrigger = (
  frequency: string,
  dayOfWeek: number,
  timeOfDay: string
): Date => {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  // Start with today at the specified time
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  if (frequency === 'daily') {
    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === 'weekly' || frequency === 'biweekly') {
    // Find the next occurrence of the specified day
    const currentDay = now.getDay();
    let daysUntil = dayOfWeek - currentDay;
    
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) {
      daysUntil += 7;
    }
    
    next.setDate(next.getDate() + daysUntil);
    
    if (frequency === 'biweekly') {
      // For biweekly, we add another week if we're in an "off" week
      // This is a simple implementation - could be enhanced with a start date
    }
  } else if (frequency === 'monthly') {
    // Schedule for the same day next month (or this month if not passed)
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
    // Ensure the day exists in the target month
    const targetDay = Math.min(dayOfWeek, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
    next.setDate(targetDay);
  }
  
  return next;
};

export const useSeoSchedule = (companyId: string | null) => {
  const [schedule, setSchedule] = useState<SeoSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!companyId) {
      setSchedule(null);
      setIsLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('seo_schedules')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching schedule:', error);
        setSchedule(null);
      } else {
        setSchedule(data as SeoSchedule | null);
      }
      setIsLoading(false);
    };

    fetchSchedule();
  }, [companyId]);

  const updateSchedule = async (updates: UpdateScheduleData) => {
    if (!companyId) return { success: false, error: 'No company selected' };

    setIsSaving(true);

    // Calculate next trigger if settings change
    let nextTriggerAt: string | undefined;
    if (updates.enabled !== false) {
      const frequency = updates.frequency || schedule?.frequency || 'weekly';
      const dayOfWeek = updates.day_of_week ?? schedule?.day_of_week ?? 1;
      const timeOfDay = updates.time_of_day || schedule?.time_of_day || '10:00:00';
      
      const nextTrigger = calculateNextTrigger(frequency, dayOfWeek, timeOfDay);
      nextTriggerAt = nextTrigger.toISOString();
    }

    const updateData = {
      ...updates,
      next_trigger_at: updates.enabled === false ? null : nextTriggerAt,
    };

    try {
      if (schedule) {
        // Update existing
        const { error } = await supabase
          .from('seo_schedules')
          .update(updateData)
          .eq('id', schedule.id);

        if (error) throw error;

        setSchedule(prev => prev ? { ...prev, ...updateData } as SeoSchedule : null);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('seo_schedules')
          .insert({
            company_id: companyId,
            ...updateData,
          })
          .select()
          .single();

        if (error) throw error;
        setSchedule(data as SeoSchedule);
      }

      toast({
        title: 'Opgeslagen',
        description: 'Trigger instellingen succesvol opgeslagen',
        duration: 3000,
      });

      setIsSaving(false);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Fout',
        description: 'Kon instellingen niet opslaan',
        variant: 'destructive',
        duration: 5000,
      });
      setIsSaving(false);
      return { success: false, error: error.message };
    }
  };

  const getNextTriggerDisplay = (): string | null => {
    if (!schedule?.enabled || !schedule?.next_trigger_at) return null;
    
    const nextTrigger = new Date(schedule.next_trigger_at);
    const now = new Date();
    
    // Format nicely in Dutch
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return nextTrigger.toLocaleDateString('nl-NL', options);
  };

  return {
    schedule,
    isLoading,
    isSaving,
    updateSchedule,
    getNextTriggerDisplay,
    calculateNextTrigger,
  };
};

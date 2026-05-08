import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSchedule {
  id: string;
  company_id: string;
  enabled: boolean;
  frequency: string;
  interval_value: number;
  interval_unit: 'days' | 'weeks' | 'months';
  day_of_week: number;
  time_of_day: string;
  last_triggered_at: string | null;
  next_trigger_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateScheduleData {
  enabled?: boolean;
  frequency?: string;
  interval_value?: number;
  interval_unit?: 'days' | 'weeks' | 'months';
  day_of_week?: number;
  time_of_day?: string;
  next_trigger_at?: string;
}

const calculateNextTrigger = (
  intervalValue: number,
  intervalUnit: 'days' | 'weeks' | 'months',
  dayOfWeek: number,
  timeOfDay: string
): Date => {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);

  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (intervalUnit === 'days') {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (intervalUnit === 'weeks') {
    const currentDay = now.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) daysUntil += 7;
    next.setDate(next.getDate() + daysUntil);
  } else if (intervalUnit === 'months') {
    const targetDay = Math.min(dayOfWeek, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
    next.setDate(targetDay);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
      const newMaxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(dayOfWeek, newMaxDay));
    }
  }

  return next;
};

export const useNewsletterSchedule = (companyId: string | null) => {
  const [schedule, setSchedule] = useState<NewsletterSchedule | null>(null);
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
        .from('newsletter_schedules' as any)
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching newsletter schedule:', error);
        setSchedule(null);
      } else {
        setSchedule(data as unknown as NewsletterSchedule | null);
      }
      setIsLoading(false);
    };

    fetchSchedule();
  }, [companyId]);

  const updateSchedule = async (updates: UpdateScheduleData) => {
    if (!companyId) return { success: false, error: 'No company selected' };

    setIsSaving(true);

    let nextTriggerAt: string | undefined;
    if (updates.enabled !== false) {
      const intervalValue = updates.interval_value ?? schedule?.interval_value ?? 1;
      const intervalUnit = updates.interval_unit ?? schedule?.interval_unit ?? 'weeks';
      const dayOfWeek = updates.day_of_week ?? schedule?.day_of_week ?? 1;
      const timeOfDay = updates.time_of_day || schedule?.time_of_day || '10:00:00';

      const nextTrigger = calculateNextTrigger(intervalValue, intervalUnit, dayOfWeek, timeOfDay);
      nextTriggerAt = nextTrigger.toISOString();
    }

    const updateData = {
      ...updates,
      next_trigger_at: updates.enabled === false ? null : nextTriggerAt,
    };

    try {
      if (schedule) {
        const { error } = await supabase
          .from('newsletter_schedules' as any)
          .update(updateData)
          .eq('id', schedule.id);

        if (error) throw error;
        setSchedule(prev => prev ? { ...prev, ...updateData } as NewsletterSchedule : null);
      } else {
        const { data, error } = await supabase
          .from('newsletter_schedules' as any)
          .insert({ company_id: companyId, ...updateData })
          .select()
          .single();

        if (error) throw error;
        setSchedule(data as unknown as NewsletterSchedule);
      }

      toast({ title: 'Opgeslagen', description: 'Trigger instellingen succesvol opgeslagen', duration: 3000 });
      setIsSaving(false);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating newsletter schedule:', error);
      toast({ title: 'Fout', description: 'Kon instellingen niet opslaan', variant: 'destructive', duration: 5000 });
      setIsSaving(false);
      return { success: false, error: error.message };
    }
  };

  const getNextTriggerDisplay = (): string | null => {
    if (!schedule?.enabled || !schedule?.next_trigger_at) return null;
    const nextTrigger = new Date(schedule.next_trigger_at);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    };
    return nextTrigger.toLocaleDateString('nl-NL', options);
  };

  return { schedule, isLoading, isSaving, updateSchedule, getNextTriggerDisplay };
};

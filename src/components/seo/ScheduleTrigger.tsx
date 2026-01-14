import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Calendar, CalendarDays } from 'lucide-react';

interface SeoSchedule {
  id: string;
  company_id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  day_of_week: number;
  time_of_day: string;
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

interface ScheduleTriggerProps {
  companyId: string | null;
  isAdmin: boolean;
  schedule: SeoSchedule | null;
  isLoading: boolean;
  isSaving: boolean;
  updateSchedule: (updates: UpdateScheduleData) => Promise<{ success: boolean; error?: string }>;
  getNextTriggerDisplay: () => string | null;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Maandag' },
  { value: 2, label: 'Dinsdag' },
  { value: 3, label: 'Woensdag' },
  { value: 4, label: 'Donderdag' },
  { value: 5, label: 'Vrijdag' },
  { value: 6, label: 'Zaterdag' },
  { value: 0, label: 'Zondag' },
];

const FREQUENCIES = [
  { value: 'daily', label: 'Dagelijks' },
  { value: 'weekly', label: 'Wekelijks' },
  { value: 'biweekly', label: 'Om de 2 weken' },
  { value: 'monthly', label: 'Maandelijks' },
];


export const ScheduleTrigger = ({ 
  companyId, 
  isAdmin, 
  schedule, 
  isLoading, 
  isSaving, 
  updateSchedule, 
  getNextTriggerDisplay 
}: ScheduleTriggerProps) => {
  // Local state for form controls
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState('10:00');

  // Sync local state with schedule data
  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.enabled);
      setFrequency(schedule.frequency);
      setDayOfWeek(schedule.day_of_week);
      setTimeOfDay(schedule.time_of_day.slice(0, 5)); // Remove seconds
    } else {
      setEnabled(false);
      setFrequency('weekly');
      setDayOfWeek(1);
      setTimeOfDay('10:00');
    }
  }, [schedule]);

  const handleEnabledChange = async (newEnabled: boolean) => {
    setEnabled(newEnabled);
    await updateSchedule({ enabled: newEnabled });
  };

  const handleFrequencyChange = async (newFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly') => {
    setFrequency(newFrequency);
    await updateSchedule({ frequency: newFrequency });
  };

  const handleDayChange = async (newDay: number) => {
    setDayOfWeek(newDay);
    await updateSchedule({ day_of_week: newDay });
  };

  const handleTimeChange = async (newTime: string) => {
    if (!newTime) return;
    setTimeOfDay(newTime);
    await updateSchedule({ time_of_day: `${newTime}:00` });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">Automatische Trigger</Label>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const showDaySelector = frequency === 'weekly' || frequency === 'biweekly';
  const nextTrigger = getNextTriggerDisplay();

  return (
    <div className="space-y-2">
      <Label className="text-white/70 text-sm">Automatische Trigger</Label>
      
      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/60" />
            <span className="text-white/80 text-sm">
              {enabled ? 'Actief' : 'Inactief'}
            </span>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleEnabledChange}
            disabled={!isAdmin || isSaving}
          />
        </div>

        {/* Settings - only show when enabled */}
        {enabled && (
          <>
            <div className="h-px bg-white/10" />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Frequency */}
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Frequentie
                </Label>
                <Select
                  value={frequency}
                  onValueChange={(v) => handleFrequencyChange(v as any)}
                  disabled={!isAdmin || isSaving}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day of Week - only for weekly/biweekly */}
              {showDaySelector && (
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Dag
                  </Label>
                  <Select
                    value={dayOfWeek.toString()}
                    onValueChange={(v) => handleDayChange(parseInt(v))}
                    disabled={!isAdmin || isSaving}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((d) => (
                        <SelectItem key={d.value} value={d.value.toString()}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Time */}
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tijd
                </Label>
                <Input
                  type="time"
                  value={timeOfDay}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={!isAdmin || isSaving}
                  className="bg-white/5 border-white/20 text-white text-sm h-9 [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Next trigger display */}
            {nextTrigger && (
              <>
                <div className="h-px bg-white/10" />
                <div className="text-sm text-white/60">
                  <span className="text-white/40">Volgende uitvoering:</span>{' '}
                  <span className="text-purple-400">{nextTrigger}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

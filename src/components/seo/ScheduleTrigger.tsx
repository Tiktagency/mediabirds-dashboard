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
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval_value?: number;
  interval_unit?: 'days' | 'weeks' | 'months';
  day_of_week?: number;
  time_of_day?: string;
  next_trigger_at?: string;
}

interface ScheduleTriggerProps {
  companyId: string | null;
  isAdmin: boolean;
  description?: string;
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

const INTERVAL_UNITS = [
  { value: 'days', label: 'dagen' },
  { value: 'weeks', label: 'weken' },
  { value: 'months', label: 'maanden' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => 
  i.toString().padStart(2, '0')
);

const MINUTES = Array.from({ length: 60 }, (_, i) => 
  i.toString().padStart(2, '0')
);

// Helper to get Dutch label for unit (singular/plural)
const getUnitLabel = (value: number, unit: 'days' | 'weeks' | 'months'): string => {
  if (unit === 'days') {
    return value === 1 ? 'dag' : 'dagen';
  } else if (unit === 'weeks') {
    return value === 1 ? 'week' : 'weken';
  } else {
    return value === 1 ? 'maand' : 'maanden';
  }
};

export const ScheduleTrigger = ({
  companyId, 
  isAdmin, 
  description,
  schedule, 
  isLoading, 
  isSaving, 
  updateSchedule, 
  getNextTriggerDisplay 
}: ScheduleTriggerProps) => {
  // Optimistic override for enabled – only active between toggle click and DB response
  const [enabledOverride, setEnabledOverride] = useState<boolean | null>(null);
  const enabled = enabledOverride ?? schedule?.enabled ?? false;

  // Local state for form controls (non-enabled fields)
  const [intervalValue, setIntervalValue] = useState(schedule?.interval_value ?? 1);
  const [intervalUnit, setIntervalUnit] = useState<'days' | 'weeks' | 'months'>(
    (schedule?.interval_unit as 'days' | 'weeks' | 'months') || 'weeks'
  );
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.day_of_week ?? 1);
  const [hours, setHours] = useState(() => {
    if (schedule?.time_of_day) return schedule.time_of_day.slice(0, 2);
    return '10';
  });
  const [minutes, setMinutes] = useState(() => {
    if (schedule?.time_of_day) return schedule.time_of_day.slice(3, 5);
    return '00';
  });

  // Sync non-enabled fields when schedule prop updates
  useEffect(() => {
    if (!schedule) return;
    setIntervalValue(schedule.interval_value || 1);
    setIntervalUnit((schedule.interval_unit as 'days' | 'weeks' | 'months') || 'weeks');
    setDayOfWeek(schedule.day_of_week);
    const timeParts = schedule.time_of_day.slice(0, 5).split(':');
    setHours(timeParts[0]);
    setMinutes(timeParts[1]);
  }, [schedule]);

  const handleEnabledChange = async (newEnabled: boolean) => {
    setEnabledOverride(newEnabled);
    await updateSchedule({ enabled: newEnabled });
    setEnabledOverride(null);
  };

  const handleIntervalValueChange = async (newValue: number) => {
    // Clamp between 1 and 31
    const clampedValue = Math.max(1, Math.min(31, newValue));
    setIntervalValue(clampedValue);
    await updateSchedule({ interval_value: clampedValue });
  };

  const handleIntervalUnitChange = async (newUnit: 'days' | 'weeks' | 'months') => {
    setIntervalUnit(newUnit);
    await updateSchedule({ interval_unit: newUnit });
  };

  const handleDayChange = async (newDay: number) => {
    setDayOfWeek(newDay);
    await updateSchedule({ day_of_week: newDay });
  };

  const handleHoursChange = async (newHours: string) => {
    setHours(newHours);
    await updateSchedule({ time_of_day: `${newHours}:${minutes}:00` });
  };

  const handleMinutesChange = async (newMinutes: string) => {
    setMinutes(newMinutes);
    await updateSchedule({ time_of_day: `${hours}:${newMinutes}:00` });
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

  // Show day selector for weeks (day of week) or months (day of month)
  const showDaySelector = intervalUnit === 'weeks' || intervalUnit === 'months';
  const nextTrigger = getNextTriggerDisplay();

  // Dynamic preview text
  const previewText = intervalValue === 1 
    ? `Elke ${getUnitLabel(1, intervalUnit)}`
    : `Elke ${intervalValue} ${getUnitLabel(intervalValue, intervalUnit)}`;

  return (
    <div className="space-y-2">
      <Label className="text-white/70 text-sm">Automatische Trigger</Label>
      {description && <p className="text-white/40 text-xs">{description}</p>}
      
      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-6">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interval Value + Unit */}
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Frequentie
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={intervalValue}
                    onChange={(e) => handleIntervalValueChange(parseInt(e.target.value) || 1)}
                    disabled={!isAdmin || isSaving}
                    className="bg-white/5 border-white/20 text-white text-sm h-9 w-16"
                  />
                  <Select
                    value={intervalUnit}
                    onValueChange={(v) => handleIntervalUnitChange(v as 'days' | 'weeks' | 'months')}
                    disabled={!isAdmin || isSaving}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-9 flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVAL_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-white/40 text-xs">{previewText}</p>
              </div>

              {/* Day selector - for weeks: day of week, for months: day number */}
              {showDaySelector && (
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {intervalUnit === 'weeks' ? 'Dag' : 'Dag van maand'}
                  </Label>
                  {intervalUnit === 'weeks' ? (
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
                  ) : (
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={dayOfWeek}
                      onChange={(e) => handleDayChange(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                      disabled={!isAdmin || isSaving}
                      className="bg-white/5 border-white/20 text-white text-sm h-9"
                    />
                  )}
                </div>
              )}

              {/* Time - Hours and Minutes */}
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tijd
                </Label>
                <div className="flex items-center gap-2">
                  {/* Hours */}
                  <Select
                    value={hours}
                    onValueChange={handleHoursChange}
                    disabled={!isAdmin || isSaving}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-9 w-16">
                      <SelectValue placeholder="Uur" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <span className="text-white/60 text-lg font-bold">:</span>
                  
                  {/* Minutes */}
                  <Select
                    value={minutes}
                    onValueChange={handleMinutesChange}
                    disabled={!isAdmin || isSaving}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-9 w-16">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Next trigger display */}
            {nextTrigger && (
              <>
                <div className="h-px bg-white/10" />
                <div className="text-sm text-white/60">
                  <span className="text-white/40">Volgende uitvoering:</span>{' '}
                  <span className="text-[#cfddd0]">{nextTrigger}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
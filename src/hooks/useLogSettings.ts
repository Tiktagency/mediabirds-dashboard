import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type LogLevel = 'basic' | 'verbose' | 'errors_only';

export interface LogSettings {
  id: string;
  log_level: LogLevel;
  retention_days: number;
  email_alerts_enabled: boolean;
  slack_alerts_enabled: boolean;
  dashboard_badge_enabled: boolean;
  alert_email: string | null;
  slack_webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  automation_name: string;
  log_level: LogLevel;
  message: string;
  status: string;
  execution_time_ms: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const useLogSettings = () => {
  const [settings, setSettings] = useState<LogSettings | null>(null);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('log_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as LogSettings);
    } catch (error) {
      console.error('Error fetching log settings:', error);
    }
  };

  const fetchLogs = async (filters?: { automation?: string; status?: string; limit?: number }) => {
    try {
      let query = supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.automation) {
        query = query.eq('automation_name', filters.automation);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data as AutomationLog[] || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<LogSettings>) => {
    if (!settings?.id) return;

    try {
      const { error } = await supabase
        .from('log_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: 'Opgeslagen',
        description: 'Log instellingen bijgewerkt',
      });
    } catch (error) {
      console.error('Error updating log settings:', error);
      toast({
        title: 'Fout',
        description: 'Kon instellingen niet opslaan',
        variant: 'destructive',
      });
    }
  };

  const exportLogs = (format: 'csv' | 'json') => {
    if (logs.length === 0) {
      toast({
        title: 'Geen data',
        description: 'Er zijn geen logs om te exporteren',
        variant: 'destructive',
      });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      filename = `automation-logs-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['id', 'automation_name', 'log_level', 'message', 'status', 'execution_time_ms', 'created_at'];
      const csvRows = [headers.join(',')];
      logs.forEach(log => {
        const row = headers.map(h => {
          const value = log[h as keyof AutomationLog];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvRows.push(row.join(','));
      });
      content = csvRows.join('\n');
      filename = `automation-logs-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Geëxporteerd',
      description: `Logs geëxporteerd als ${format.toUpperCase()}`,
    });
  };

  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  return { settings, logs, isLoading, updateSettings, fetchLogs, exportLogs };
};

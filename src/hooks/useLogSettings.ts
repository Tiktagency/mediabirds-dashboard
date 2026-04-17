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
  const [allAutomationNames, setAllAutomationNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const fetchN8nLogs = async (limit: number = 100, workflowNames?: string[]): Promise<AutomationLog[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-n8n-logs', {
        body: { limit, workflowNames },
      });

      if (error) {
        console.error('Error fetching n8n logs:', error);
        return [];
      }

      // Transform n8n logs to match AutomationLog interface
      const n8nLogs: AutomationLog[] = (data?.logs || []).map((log: any) => ({
        id: `n8n-${log.id}`,
        automation_name: log.automation_name,
        log_level: 'basic' as LogLevel,
        message: log.message,
        status: log.status,
        execution_time_ms: log.execution_time_ms,
        metadata: log.metadata,
        created_at: log.created_at,
      }));

      return n8nLogs;
    } catch (error) {
      console.error('Error fetching n8n logs:', error);
      return [];
    }
  };

  const fetchConnectedWorkflowNames = async (): Promise<string[]> => {
    try {
      // Get n8n workflow names from automation_settings
      const { data: automationData, error: automationError } = await supabase
        .from('automation_settings')
        .select('n8n_workflow_name')
        .not('n8n_workflow_name', 'is', null);

      if (automationError) throw automationError;

      // Get n8n workflow names from companies
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('seo_research_n8n_name, subkeywords_n8n_name, blogs_n8n_name');

      if (companyError) throw companyError;

      const workflowNames: string[] = [];

      // Add automation_settings workflow names
      automationData?.forEach((item: any) => {
        if (item.n8n_workflow_name) {
          workflowNames.push(item.n8n_workflow_name);
        }
      });

      // Add company workflow names
      companyData?.forEach((company: any) => {
        if (company.seo_research_n8n_name) workflowNames.push(company.seo_research_n8n_name);
        if (company.subkeywords_n8n_name) workflowNames.push(company.subkeywords_n8n_name);
        if (company.blogs_n8n_name) workflowNames.push(company.blogs_n8n_name);
      });

      // Remove duplicates
      return [...new Set(workflowNames)];
    } catch (error) {
      console.error('Error fetching connected workflow names:', error);
      return [];
    }
  };

  const fetchLogs = async (filters?: { automation?: string; status?: string }) => {
    try {
      // Only show full loading on initial load, use refreshing for subsequent calls
      if (logs.length === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Get connected workflow names first
      const connectedWorkflows = await fetchConnectedWorkflowNames();
      
      // Fetch 100 most recent n8n logs for connected workflows
      const n8nLogs = await fetchN8nLogs(100, connectedWorkflows);

      // Also fetch local logs from automation_logs table (without filters to get all names)
      const { data: localLogs, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Combine logs
      const combinedLogs = [
        ...n8nLogs,
        ...(localLogs as AutomationLog[] || []),
      ];

      // Sort by created_at descending
      combinedLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Take only 100 most recent
      const recentLogs = combinedLogs.slice(0, 100);

      // Extract all unique automation names BEFORE filtering
      const uniqueNames = [...new Set(recentLogs.map(log => log.automation_name))];
      setAllAutomationNames(uniqueNames);

      // Apply filters for display
      let filteredLogs = recentLogs;
      if (filters?.automation) {
        filteredLogs = filteredLogs.filter(log => 
          log.automation_name.toLowerCase().includes(filters.automation!.toLowerCase())
        );
      }
      if (filters?.status) {
        filteredLogs = filteredLogs.filter(log => log.status === filters.status);
      }

      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  return { settings, logs, allAutomationNames, isLoading, isRefreshing, updateSettings, fetchLogs, exportLogs };
};

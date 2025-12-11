import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ImpactLevel = 'high' | 'medium' | 'low';
export type AutomationStatusType = 'active' | 'inactive' | 'testmode';

export interface AutomationSetting {
  id: string;
  automation_name: string;
  display_name: string;
  description: string | null;
  impact_level: ImpactLevel;
  category: string | null;
  status: AutomationStatusType;
  webhook_url: string | null;
  webhook_backup_url: string | null;
  n8n_workflow_name: string | null;
  time_saved_per_execution: number | null;
  created_at: string;
  updated_at: string;
}

export const useAutomationSettings = () => {
  const [settings, setSettings] = useState<AutomationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .order('display_name');

      if (error) throw error;
      
      setSettings(data as AutomationSetting[] || []);
    } catch (error) {
      console.error('Error fetching automation settings:', error);
      toast({
        title: 'Fout',
        description: 'Kon automation instellingen niet laden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (id: string, updates: Partial<AutomationSetting>) => {
    try {
      const { error } = await supabase
        .from('automation_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSettings(prev => 
        prev.map(s => s.id === id ? { ...s, ...updates } : s)
      );

      toast({
        title: 'Opgeslagen',
        description: 'Automation instelling bijgewerkt',
      });
    } catch (error) {
      console.error('Error updating automation setting:', error);
      toast({
        title: 'Fout',
        description: 'Kon instelling niet opslaan',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, isLoading, updateSetting, refetch: fetchSettings };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoleDefaultPermission {
  id: string;
  role: string;
  automation_name: string;
  can_view: boolean;
  can_execute: boolean;
  can_manage: boolean;
}

const DEFAULT_PERMISSIONS: Record<string, { can_view: boolean; can_execute: boolean; can_manage: boolean }> = {
  viewer: { can_view: true, can_execute: false, can_manage: false },
  operator: { can_view: true, can_execute: true, can_manage: false },
};

export const useRoleDefaults = () => {
  const [permissions, setPermissions] = useState<RoleDefaultPermission[]>([]);
  const [automations, setAutomations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [permRes, autoRes] = await Promise.all([
        supabase.from('role_default_permissions').select('*'),
        supabase.from('automation_settings').select('automation_name').order('automation_name'),
      ]);

      if (permRes.error) throw permRes.error;
      if (autoRes.error) throw autoRes.error;

      setPermissions((permRes.data as RoleDefaultPermission[]) || []);
      setAutomations((autoRes.data || []).map(a => a.automation_name));
    } catch (error) {
      console.error('Error fetching role defaults:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPermission = useCallback(
    (role: string, automationName: string) => {
      const found = permissions.find(p => p.role === role && p.automation_name === automationName);
      if (found) return { can_view: found.can_view, can_execute: found.can_execute, can_manage: found.can_manage };
      // Return defaults if no row exists
      return DEFAULT_PERMISSIONS[role] || { can_view: true, can_execute: true, can_manage: true };
    },
    [permissions]
  );

  const updatePermission = async (
    role: string,
    automationName: string,
    field: 'can_view' | 'can_execute' | 'can_manage',
    value: boolean
  ) => {
    try {
      const existing = permissions.find(p => p.role === role && p.automation_name === automationName);

      if (existing) {
        const { error } = await supabase
          .from('role_default_permissions')
          .update({ [field]: value })
          .eq('id', existing.id);
        if (error) throw error;
        setPermissions(prev =>
          prev.map(p => (p.id === existing.id ? { ...p, [field]: value } : p))
        );
      } else {
        const defaults = DEFAULT_PERMISSIONS[role] || { can_view: true, can_execute: true, can_manage: true };
        const newRow = { role: role as 'viewer' | 'operator' | 'admin' | 'super_admin' | 'moderator' | 'user', automation_name: automationName, ...defaults, [field]: value };
        const { data, error } = await supabase
          .from('role_default_permissions')
          .insert(newRow)
          .select()
          .single();
        if (error) throw error;
        setPermissions(prev => [...prev, data as RoleDefaultPermission]);
      }

      toast({ title: 'Opgeslagen', description: 'Rolmachtiging bijgewerkt' });
    } catch (error) {
      console.error('Error updating role default:', error);
      toast({ title: 'Fout', description: 'Kon machtiging niet bijwerken', variant: 'destructive' });
    }
  };

  const resetToDefaults = async () => {
    try {
      // Delete all existing role default permissions
      const { error: deleteError } = await supabase
        .from('role_default_permissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

      if (deleteError) throw deleteError;

      // Re-insert defaults for viewer and operator for each automation
      const rows = automations.flatMap(name =>
        (['viewer', 'operator'] as const).map(role => ({
          role: role as 'viewer' | 'operator',
          automation_name: name,
          ...DEFAULT_PERMISSIONS[role],
        }))
      );

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from('role_default_permissions')
          .insert(rows);
        if (insertError) throw insertError;
      }

      await fetchData();
      toast({ title: 'Gereset', description: 'Standaardmachtigingen hersteld' });
    } catch (error) {
      console.error('Error resetting defaults:', error);
      toast({ title: 'Fout', description: 'Kon niet resetten', variant: 'destructive' });
    }
  };

  return { permissions, automations, isLoading, getPermission, updatePermission, resetToDefaults };
};

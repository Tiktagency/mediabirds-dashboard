import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserPermission } from './useUserManagement';

interface UserPermissionsState {
  roles: AppRole[];
  permissions: UserPermission[];
  isAdmin: boolean;
  isOperator: boolean;
  isViewer: boolean;
  isLoading: boolean;
}

export const useUserPermissions = () => {
  const [state, setState] = useState<UserPermissionsState>({
    roles: [],
    permissions: [],
    isAdmin: false,
    isOperator: false,
    isViewer: false,
    isLoading: true,
  });

  const fetchUserPermissions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Fetch user automation permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_automation_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
      }

      const userRoles = (roles || []).map(r => r.role as AppRole);
      const isAdmin = userRoles.includes('admin');
      const isOperator = userRoles.includes('operator');
      const isViewer = userRoles.includes('viewer');

      setState({
        roles: userRoles,
        permissions: (permissions as UserPermission[]) || [],
        isAdmin,
        isOperator,
        isViewer,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const canView = useCallback((automationName: string): boolean => {
    // Admins can view everything
    if (state.isAdmin) return true;
    
    // Check specific permission first (overrides role default)
    const permission = state.permissions.find(p => p.automation_name === automationName);
    if (permission) {
      return permission.can_view;
    }
    
    // Fall back to role defaults: Operators and Viewers can view by default
    if (state.isOperator || state.isViewer) return true;
    
    return false;
  }, [state.isAdmin, state.isOperator, state.isViewer, state.permissions]);

  const canExecute = useCallback((automationName: string): boolean => {
    // Admins can execute everything
    if (state.isAdmin) return true;
    
    // Check specific permission first (overrides role default)
    const permission = state.permissions.find(p => p.automation_name === automationName);
    if (permission) {
      return permission.can_execute;
    }
    
    // Fall back to role defaults: Operators can execute by default, Viewers cannot
    if (state.isOperator) return true;
    
    return false;
  }, [state.isAdmin, state.isOperator, state.permissions]);

  const canManage = useCallback((automationName: string): boolean => {
    // Only admins can manage
    if (state.isAdmin) return true;
    
    const permission = state.permissions.find(p => p.automation_name === automationName);
    return permission?.can_manage ?? false;
  }, [state.isAdmin, state.permissions]);

  return {
    ...state,
    canView,
    canExecute,
    canManage,
    refetch: fetchUserPermissions,
  };
};

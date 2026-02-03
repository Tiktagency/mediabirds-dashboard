import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'super_admin' | 'admin' | 'moderator' | 'user' | 'viewer' | 'operator';

export interface UserProfile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  roles: AppRole[];
}

export interface UserPermission {
  id: string;
  user_id: string;
  automation_name: string;
  can_view: boolean;
  can_execute: boolean;
  can_manage: boolean;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Continue without roles if there's an error
      }

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        roles: (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Fout',
        description: 'Kon gebruikers niet laden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_automation_permissions')
        .select('*');

      if (error) throw error;
      setPermissions(data as UserPermission[] || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  }, []);

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    // Store previous state for rollback
    const previousUsers = users;
    
    // Optimistic update FIRST for instant feedback
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, roles: [newRole] } : u)
    );

    try {
      // Call edge function to update role in background
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: { action: 'assign-role', userId, role: newRole },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Opgeslagen',
        description: 'Gebruikersrol bijgewerkt',
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      // Rollback optimistic update
      setUsers(previousUsers);
      toast({
        title: 'Fout',
        description: error.message || 'Kon rol niet bijwerken',
        variant: 'destructive',
      });
    }
  };

  const updatePermission = async (
    userId: string, 
    automationName: string, 
    updates: Partial<Pick<UserPermission, 'can_view' | 'can_execute' | 'can_manage'>>
  ) => {
    try {
      // Check if permission exists
      const existing = permissions.find(
        p => p.user_id === userId && p.automation_name === automationName
      );

      if (existing) {
        const { error } = await supabase
          .from('user_automation_permissions')
          .update(updates)
          .eq('id', existing.id);

        if (error) throw error;

        setPermissions(prev =>
          prev.map(p => p.id === existing.id ? { ...p, ...updates } : p)
        );
      } else {
        const { data, error } = await supabase
          .from('user_automation_permissions')
          .insert({
            user_id: userId,
            automation_name: automationName,
            can_view: updates.can_view ?? true,
            can_execute: updates.can_execute ?? false,
            can_manage: updates.can_manage ?? false,
          })
          .select()
          .single();

        if (error) throw error;
        setPermissions(prev => [...prev, data as UserPermission]);
      }

      toast({
        title: 'Opgeslagen',
        description: 'Permissies bijgewerkt',
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Fout',
        description: 'Kon permissies niet bijwerken',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string) => {
    // Store previous state for rollback
    const previousUsers = users;
    const previousPermissions = permissions;
    
    // Optimistic update FIRST for instant feedback
    setUsers(prev => prev.filter(u => u.id !== userId));
    setPermissions(prev => prev.filter(p => p.user_id !== userId));

    try {
      // Call edge function to delete user in background
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: { action: 'delete-user', userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Verwijderd',
        description: 'Gebruiker volledig verwijderd uit het systeem',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      // Rollback optimistic update
      setUsers(previousUsers);
      setPermissions(previousPermissions);
      toast({
        title: 'Fout',
        description: error.message || 'Kon gebruiker niet verwijderen',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [fetchUsers, fetchPermissions]);

  return {
    users,
    permissions,
    isLoading,
    updateUserRole,
    updatePermission,
    deleteUser,
    refetch: () => { fetchUsers(); fetchPermissions(); },
  };
};

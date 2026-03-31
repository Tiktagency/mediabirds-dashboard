import { useUserManagement } from '@/hooks/useUserManagement';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { UserList } from './UserList';
import { PermissionMatrix } from './PermissionMatrix';
import { Skeleton } from '@/components/ui/skeleton';

export const UsersTab = () => {
  const { users, permissions, isLoading, updateUserRole, updatePermission, deleteUser } = useUserManagement();
  const { settings: automations } = useAutomationSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Gebruikersbeheer</h3>
        <p className="text-sm text-muted-foreground">
          Beheer gebruikers, rollen en automation permissies.
        </p>
      </div>

      <UserList 
        users={users} 
        onUpdateRole={updateUserRole}
        onDelete={deleteUser}
      />

      <PermissionMatrix
        users={users}
        automations={automations}
        permissions={permissions}
        onUpdatePermission={updatePermission}
      />
    </div>
  );
};

import { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { UserList } from './UserList';
import { PermissionMatrix } from './PermissionMatrix';
import { InviteUserModal } from './InviteUserModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Users, Shield, Play, Eye } from 'lucide-react';

export const UsersTab = () => {
  const { users, permissions, isLoading, updateUserRole, updatePermission, deleteUser, refetch } = useUserManagement();
  const { settings: automations } = useAutomationSettings();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const adminCount = users.filter(u => u.roles.includes('admin')).length;
  const operatorCount = users.filter(u => u.roles.includes('operator')).length;
  const viewerCount = users.filter(u => u.roles.includes('viewer')).length;

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Gebruikersbeheer</h3>
          <p className="text-sm text-muted-foreground">
            Beheer gebruikers, rollen en automation permissies.
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)} variant="primaryCustom" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Gebruiker uitnodigen
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Totaal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Play className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{operatorCount}</p>
                <p className="text-xs text-muted-foreground">Operators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{viewerCount}</p>
                <p className="text-xs text-muted-foreground">Viewers</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

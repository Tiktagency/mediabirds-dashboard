import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Eye, Play, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserProfile, UserPermission } from '@/hooks/useUserManagement';
import type { AutomationSetting } from '@/hooks/useAutomationSettings';

interface PermissionMatrixProps {
  users: UserProfile[];
  automations: AutomationSetting[];
  permissions: UserPermission[];
  onUpdatePermission: (
    userId: string, 
    automationName: string, 
    updates: Partial<Pick<UserPermission, 'can_view' | 'can_execute' | 'can_manage'>>
  ) => Promise<void>;
}

export const PermissionMatrix = ({ 
  users, 
  automations, 
  permissions, 
  onUpdatePermission 
}: PermissionMatrixProps) => {
  const getPermission = (userId: string, automationName: string): UserPermission | undefined => {
    return permissions.find(p => p.user_id === userId && p.automation_name === automationName);
  };

  // Check if user has a specific role
  const hasRole = (user: UserProfile, role: string): boolean => {
    return user.roles.includes(role as any);
  };

  // Get effective permissions based on role defaults and specific overrides
  const getEffectivePermissions = (user: UserProfile, automationName: string) => {
    const isViewer = hasRole(user, 'viewer');
    const isOperator = hasRole(user, 'operator');
    const perm = getPermission(user.id, automationName);

    // If specific permission exists, use it; otherwise use role defaults
    const hasSpecificPermission = !!perm;
    
    return {
      can_view: hasSpecificPermission ? perm.can_view : (isViewer || isOperator),
      can_execute: hasSpecificPermission ? perm.can_execute : isOperator,
      can_manage: perm?.can_manage ?? false,
      // Track if using role default (for visual styling)
      is_role_default: !hasSpecificPermission && (isViewer || isOperator),
    };
  };

  // Filter out admins and super_admins - they have full access
  const nonAdminUsers = users.filter(u => !u.roles.includes('admin') && !u.roles.includes('super_admin'));

  if (automations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="w-4 h-4" />
          Permissie Matrix
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Stel per gebruiker in welke automations ze mogen bekijken, uitvoeren of beheren.
          Rol-standaarden worden automatisch ingesteld maar kunnen worden aangepast.
        </p>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
            Viewer = Standaard alles bekijken
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
            Operator = Standaard alles bekijken + uitvoeren
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400">
            Admin = Volledige toegang
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {nonAdminUsers.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Alle gebruikers zijn admin en hebben volledige toegang.
          </p>
        ) : (
          <div className="border border-border/30 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background/30">
                  <TableHead className="w-[200px]">Gebruiker</TableHead>
                  {automations.map(automation => (
                    <TableHead key={automation.id} className="text-center min-w-[150px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">{automation.display_name}</span>
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />V
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Play className="w-3 h-3" />U
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Settings className="w-3 h-3" />B
                          </span>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonAdminUsers.map(user => (
                  <TableRow key={user.id} className="hover:bg-background/20">
                    <TableCell className="font-medium text-sm">
                      <div className="flex flex-col gap-1">
                        <span>{user.email}</span>
                        <div className="flex gap-1">
                          {hasRole(user, 'viewer') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-500/10 border-green-500/30 text-green-400">
                              Viewer
                            </Badge>
                          )}
                          {hasRole(user, 'operator') && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 border-blue-500/30 text-blue-400">
                              Operator
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {automations.map(automation => {
                      const effectivePerm = getEffectivePermissions(user, automation.automation_name);
                      return (
                        <TableCell key={automation.id} className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Checkbox
                              checked={effectivePerm.can_view}
                              onCheckedChange={(checked) => 
                                onUpdatePermission(user.id, automation.automation_name, { can_view: !!checked })
                              }
                              title="Bekijken"
                            />
                            <Checkbox
                              checked={effectivePerm.can_execute}
                              onCheckedChange={(checked) => 
                                onUpdatePermission(user.id, automation.automation_name, { can_execute: !!checked })
                              }
                              title="Uitvoeren"
                            />
                            <Checkbox
                              checked={effectivePerm.can_manage}
                              onCheckedChange={(checked) => 
                                onUpdatePermission(user.id, automation.automation_name, { can_manage: !!checked })
                              }
                              title="Beheren"
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> V = Bekijken
          </span>
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" /> U = Uitvoeren
          </span>
          <span className="flex items-center gap-1">
            <Settings className="w-3 h-3" /> B = Beheren
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

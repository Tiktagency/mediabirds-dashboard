import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Trash2, Shield, Eye, Play, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { UserProfile, AppRole } from '@/hooks/useUserManagement';

interface UserListProps {
  users: UserProfile[];
  currentUserId?: string;
  onUpdateRole: (userId: string, role: AppRole) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

// Role hierarchy for filtering
const roleHierarchy: Record<AppRole, number> = {
  'super_admin': 4,
  'admin': 3,
  'operator': 2,
  'viewer': 1,
  'moderator': 0,
  'user': 0,
};

function getRoleLevel(role: AppRole): number {
  return roleHierarchy[role] || 0;
}

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  super_admin: { 
    label: 'Super Admin', 
    icon: <Crown className="w-3 h-3" />, 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
  },
  admin: { 
    label: 'Admin', 
    icon: <Shield className="w-3 h-3" />, 
    color: 'bg-red-500/20 text-red-400 border-red-500/30' 
  },
  operator: { 
    label: 'Operator', 
    icon: <Play className="w-3 h-3" />, 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
  },
  viewer: { 
    label: 'Viewer', 
    icon: <Eye className="w-3 h-3" />, 
    color: 'bg-green-500/20 text-green-400 border-green-500/30' 
  },
  moderator: { 
    label: 'Moderator', 
    icon: <Shield className="w-3 h-3" />, 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
  },
  user: { 
    label: 'Gebruiker', 
    icon: <Users className="w-3 h-3" />, 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' 
  },
};

export const UserList = ({ users, currentUserId, onUpdateRole, onDelete }: UserListProps) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  // Get available roles for a user (filters out lower roles for current user)
  const getAvailableRoles = (targetUser: UserProfile) => {
    const allRoles: { value: AppRole; label: string; icon: React.ReactNode }[] = [
      { value: 'super_admin', label: 'Super Admin', icon: <Crown className="w-3 h-3 text-purple-400" /> },
      { value: 'admin', label: 'Admin', icon: <Shield className="w-3 h-3" /> },
      { value: 'operator', label: 'Operator', icon: <Play className="w-3 h-3" /> },
      { value: 'viewer', label: 'Viewer', icon: <Eye className="w-3 h-3" /> },
    ];
    
    // If editing self, only show roles >= current level
    if (targetUser.id === currentUserId) {
      const currentLevel = Math.max(...targetUser.roles.map(r => getRoleLevel(r)), 0);
      return allRoles.filter(r => getRoleLevel(r.value) >= currentLevel);
    }
    
    return allRoles;
  };

  const handleRoleChange = async (userId: string, role: AppRole) => {
    setUpdatingUserId(userId);
    await onUpdateRole(userId, role);
    setUpdatingUserId(null);
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4" />
          Gebruikers ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Geen gebruikers gevonden</p>
          ) : (
            users.map(user => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-foreground">{user.email || 'Geen email'}</p>
                    {user.roles.map(role => (
                      <Badge key={role} variant="outline" className={roleConfig[role]?.color}>
                        {roleConfig[role]?.icon}
                        <span className="ml-1">{roleConfig[role]?.label}</span>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aangemaakt: {format(new Date(user.created_at), 'dd MMM yyyy', { locale: nl })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={user.roles[0] || 'viewer'}
                    onValueChange={(value: AppRole) => handleRoleChange(user.id, value)}
                    disabled={updatingUserId === user.id || (user.id === currentUserId && getAvailableRoles(user).length <= 1)}
                  >
                    <SelectTrigger className="w-[130px] bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles(user).map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <span className="flex items-center gap-2">
                            {role.icon} {role.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Gebruiker verwijderen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Weet je zeker dat je {user.email} wilt verwijderen? 
                          Dit verwijdert alle rollen en permissies van deze gebruiker.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(user.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Verwijderen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

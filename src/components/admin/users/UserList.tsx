import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Trash2, Shield, Eye, Play } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { UserProfile, AppRole } from '@/hooks/useUserManagement';

interface UserListProps {
  users: UserProfile[];
  onUpdateRole: (userId: string, role: AppRole) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
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
};

export const UserList = ({ users, onUpdateRole, onDelete }: UserListProps) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

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
                    disabled={updatingUserId === user.id}
                  >
                    <SelectTrigger className="w-[130px] bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <span className="flex items-center gap-2">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      </SelectItem>
                      <SelectItem value="operator">
                        <span className="flex items-center gap-2">
                          <Play className="w-3 h-3" /> Operator
                        </span>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <span className="flex items-center gap-2">
                          <Eye className="w-3 h-3" /> Viewer
                        </span>
                      </SelectItem>
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

import { useRoleDefaults } from '@/hooks/useRoleDefaults';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RotateCcw, Check, X } from 'lucide-react';

const ROLES = ['viewer', 'operator', 'admin', 'super_admin'] as const;
const EDITABLE_ROLES = ['viewer', 'operator'] as const;

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  operator: 'Operator',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const PERMISSION_LABELS: Record<string, string> = {
  can_view: 'Bekijken',
  can_execute: 'Uitvoeren',
  can_manage: 'Beheren',
};

interface SystemPermission {
  label: string;
  roles: Record<string, boolean>;
}

const SYSTEM_PERMISSIONS: SystemPermission[] = [
  { label: 'Dashboard bekijken', roles: { viewer: true, operator: true, admin: true, super_admin: true } },
  { label: 'Automations uitvoeren', roles: { viewer: false, operator: true, admin: true, super_admin: true } },
  { label: 'Admin Panel openen', roles: { viewer: false, operator: false, admin: true, super_admin: true } },
  { label: 'Gebruikers uitnodigen', roles: { viewer: false, operator: false, admin: true, super_admin: true } },
  { label: 'Rollen toewijzen/degraderen', roles: { viewer: false, operator: false, admin: true, super_admin: true } },
  { label: 'Automation-instellingen beheren', roles: { viewer: false, operator: false, admin: true, super_admin: true } },
  { label: 'Andere admins beheren', roles: { viewer: false, operator: false, admin: false, super_admin: true } },
];

const PERMISSION_FIELDS = ['can_view', 'can_execute', 'can_manage'] as const;

export const RolesTab = () => {
  const { automations, isLoading, getPermission, updatePermission, resetToDefaults } = useRoleDefaults();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isEditable = (role: string) => (EDITABLE_ROLES as readonly string[]).includes(role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rolmachtigingen overzicht</h3>
          <p className="text-sm text-muted-foreground">
            Bekijk systeemmachtigingen en beheer automatiemachtigingen per rol.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset naar standaard
        </Button>
      </div>

      <div className="border border-border/30 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50">
              <TableHead className="min-w-[220px]">Machtiging</TableHead>
              {ROLES.map(role => (
                <TableHead key={role} className="text-center min-w-[100px]">
                  {ROLE_LABELS[role]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Section header: Systeemmachtigingen */}
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableCell colSpan={5} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-2">
                Systeemmachtigingen
              </TableCell>
            </TableRow>

            {SYSTEM_PERMISSIONS.map((perm) => (
              <TableRow key={perm.label}>
                <TableCell className="text-sm">{perm.label}</TableCell>
                {ROLES.map(role => (
                  <TableCell key={role} className="text-center">
                    {perm.roles[role] ? (
                      <Check className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Section header: Automatiemachtigingen */}
            {automations.length > 0 && (
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell colSpan={5} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-2">
                  Automatiemachtigingen
                </TableCell>
              </TableRow>
            )}

            {automations.map((automation) =>
              PERMISSION_FIELDS.map((field, fieldIdx) => (
                <TableRow key={`${automation}-${field}`} className={fieldIdx === 0 ? 'border-t border-border/20' : ''}>
                  <TableCell className="text-sm">
                    <span className={fieldIdx === 0 ? 'font-medium' : 'pl-4 text-muted-foreground'}>
                      {fieldIdx === 0 ? `${automation} — ` : ''}
                      {PERMISSION_LABELS[field]}
                    </span>
                  </TableCell>
                  {ROLES.map(role => {
                    if (isEditable(role)) {
                      const perm = getPermission(role, automation);
                      return (
                        <TableCell key={role} className="text-center">
                          <Checkbox
                            checked={perm[field]}
                            onCheckedChange={(checked) =>
                              updatePermission(role, automation, field, !!checked)
                            }
                            className="mx-auto"
                          />
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={role} className="text-center">
                        <Check className="w-4 h-4 text-primary mx-auto opacity-50" />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

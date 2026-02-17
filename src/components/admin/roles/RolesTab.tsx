import { useRoleDefaults } from '@/hooks/useRoleDefaults';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RotateCcw } from 'lucide-react';

const EDITABLE_ROLES = ['viewer', 'operator'] as const;
const LOCKED_ROLES = ['admin', 'super_admin'] as const;

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  operator: 'Operator',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const PERMISSION_FIELDS = [
  { key: 'can_view' as const, label: 'V' },
  { key: 'can_execute' as const, label: 'U' },
  { key: 'can_manage' as const, label: 'B' },
];

export const RolesTab = () => {
  const { automations, isLoading, getPermission, updatePermission, resetToDefaults } = useRoleDefaults();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (automations.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Geen automations gevonden.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Standaard rolmachtigingen</h3>
          <p className="text-sm text-muted-foreground">
            Beheer de standaard machtigingen per rol. V = Bekijken, U = Uitvoeren, B = Beheren.
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
              <TableHead className="min-w-[120px]">Rol</TableHead>
              {automations.map(name => (
                <TableHead key={name} className="text-center min-w-[100px]">
                  <span className="text-xs">{name}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Editable roles */}
            {EDITABLE_ROLES.map(role => (
              <TableRow key={role}>
                <TableCell className="font-medium">{ROLE_LABELS[role]}</TableCell>
                {automations.map(automation => {
                  const perm = getPermission(role, automation);
                  return (
                    <TableCell key={automation} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {PERMISSION_FIELDS.map(field => (
                          <label key={field.key} className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                            <Checkbox
                              checked={perm[field.key]}
                              onCheckedChange={(checked) =>
                                updatePermission(role, automation, field.key, !!checked)
                              }
                            />
                            {field.label}
                          </label>
                        ))}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

            {/* Locked roles (admin / super_admin) */}
            {LOCKED_ROLES.map(role => (
              <TableRow key={role} className="opacity-50">
                <TableCell className="font-medium">{ROLE_LABELS[role]}</TableCell>
                {automations.map(automation => (
                  <TableCell key={automation} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {PERMISSION_FIELDS.map(field => (
                        <label key={field.key} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Checkbox checked disabled />
                          {field.label}
                        </label>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

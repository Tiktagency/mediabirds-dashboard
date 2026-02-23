import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';

interface CompanyOverview {
  id: string;
  name: string;
  managed_by: string | null;
  manager_email: string | null;
}

interface CompanyOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CompanyOverviewDialog = ({ open, onOpenChange }: CompanyOverviewDialogProps) => {
  const [companies, setCompanies] = useState<CompanyOverview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setIsLoading(true);

      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name, managed_by')
        .order('name', { ascending: true });

      if (!companiesData) {
        setIsLoading(false);
        return;
      }

      const managerIds = companiesData
        .map(c => (c as any).managed_by)
        .filter(Boolean) as string[];

      let profilesMap: Record<string, string> = {};
      if (managerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', managerIds);

        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.id, p.email || 'Onbekend']));
        }
      }

      setCompanies(
        companiesData.map(c => ({
          id: c.id,
          name: c.name,
          managed_by: (c as any).managed_by,
          manager_email: (c as any).managed_by ? profilesMap[(c as any).managed_by] || 'Onbekend' : null,
        }))
      );
      setIsLoading(false);
    };

    fetchData();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Building2 className="h-5 w-5" />
            Bedrijfsoverzicht
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : companies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Geen bedrijven gevonden</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Bedrijf</TableHead>
                  <TableHead className="text-white/70">Beheerd door</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map(company => (
                  <TableRow key={company.id} className="border-white/5">
                    <TableCell className="text-white font-medium">{company.name}</TableCell>
                    <TableCell className={company.manager_email ? 'text-white/80' : 'text-white/30'}>
                      {company.manager_email || '–'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyOverviewDialog;

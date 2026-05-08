import { useState, useEffect } from 'react';
import { ChevronDown, Building2, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  seo_research_webhook: string | null;
  subkeywords_webhook: string | null;
  blogs_webhook: string | null;
  auth_token_secret_name: string | null;
  seo_research_n8n_name: string | null;
  subkeywords_n8n_name: string | null;
  blogs_n8n_name: string | null;
  domain: string | null;
}

interface CompanySelectorProps {
  selectedCompany: Company | null;
  onCompanyChange: (company: Company) => void;
}

const CompanySelector = ({ selectedCompany, onCompanyChange }: CompanySelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDomain, setNewCompanyDomain] = useState('');
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin'])
        .maybeSingle();
        setIsAdmin(!!data);
      }
    };

    checkAdminStatus();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;

      setCompanies(data || []);
      
      // Auto-select first company or restore from localStorage
      if (data && data.length > 0) {
        const savedCompanyId = localStorage.getItem('selectedCompanyId');
        const savedCompany = data.find(c => c.id === savedCompanyId);
        
        if (savedCompany) {
          onCompanyChange(savedCompany);
        } else {
          onCompanyChange(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSelectCompany = (company: Company) => {
    localStorage.setItem('selectedCompanyId', company.id);
    onCompanyChange(company);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    setIsDeleting(true);
    try {
      // First delete blog_settings for this company (cascade)
      await supabase
        .from('blog_settings')
        .delete()
        .eq('company_id', companyToDelete.id);

      // Then delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyToDelete.id);

      if (error) throw error;

      toast({
        title: 'Bedrijf verwijderd',
        description: `${companyToDelete.name} is succesvol verwijderd`,
      });

      // If the deleted company was selected, select another one
      if (selectedCompany?.id === companyToDelete.id) {
        localStorage.removeItem('selectedCompanyId');
      }

      setCompanyToDelete(null);
      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Fout bij verwijderen',
        description: 'Er ging iets mis bij het verwijderen van het bedrijf',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestAdd = () => {
    if (!newCompanyName.trim() || !newCompanyDomain.trim()) {
      toast({
        title: 'Vul alle velden in',
        variant: 'destructive',
      });
      return;
    }
    setIsDialogOpen(false);
    setShowConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompanyName.trim(),
          domain: newCompanyDomain.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      try {
        const { data: webhookResult, error: webhookError } = await supabase.functions.invoke('trigger-add-company-webhook', {
          body: { companyName: newCompanyName.trim(), companyId: data.id, companyDomain: newCompanyDomain.trim() },
        });

        if (webhookError || !webhookResult?.success) {
          console.error('Webhook call failed:', webhookError || webhookResult?.errors);
          toast({
            title: 'Bedrijf toegevoegd',
            description: `${newCompanyName} is aangemaakt, maar de documenten konden niet automatisch worden ingevuld. Vul ze handmatig in.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Bedrijf toegevoegd',
            description: `${newCompanyName} is succesvol aangemaakt en de documenten zijn automatisch ingevuld`,
          });
        }
      } catch (webhookErr) {
        console.error('Webhook call failed:', webhookErr);
        toast({
          title: 'Bedrijf toegevoegd',
          description: `${newCompanyName} is aangemaakt, maar de documenten konden niet automatisch worden ingevuld.`,
          variant: 'destructive',
        });
      }

      setNewCompanyName('');
      setNewCompanyDomain('');
      setShowConfirmAdd(false);

      await fetchCompanies();
      if (data) {
        handleSelectCompany(data);
      }
    } catch (error) {
      console.error('Error adding company:', error);
      toast({
        title: 'Fout bij toevoegen',
        description: 'Er ging iets mis bij het toevoegen van het bedrijf',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-white/50 text-sm">Laden...</span>
      </div>
    );
  }

  if (companies.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-white/5 border-white/20 text-white gap-2"
          >
            <Building2 className="w-4 h-4" />
            {selectedCompany?.name || 'Selecteer bedrijf'}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-card border-white/20 min-w-[200px] z-50"
        >
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleSelectCompany(company)}
              className={`group text-white/80 hover:text-white hover:bg-white/10 cursor-pointer flex items-center justify-between ${
                selectedCompany?.id === company.id ? 'bg-white/10 text-white' : ''
              }`}
            >
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                {company.name}
              </div>
              {isAdmin && (
                <Trash2
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompanyToDelete(company);
                  }}
                />
              )}
            </DropdownMenuItem>
          ))}
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Bedrijf toevoegen
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-white/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Nieuw bedrijf toevoegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white/70">Bedrijfsnaam</Label>
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Naam van het bedrijf"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Website domeinnaam</Label>
              <Input
                value={newCompanyDomain}
                onChange={(e) => setNewCompanyDomain(e.target.value)}
                placeholder="bijv. mediabirds.nl"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <p className="text-sm text-white/50">
              Na het toevoegen worden de bijbehorende documenten automatisch aangemaakt.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/20 text-white"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleRequestAdd}
                disabled={!newCompanyName.trim() || !newCompanyDomain.trim()}
                className="bg-[#cfddd0] hover:bg-[#bccfbd] text-gray-900"
              >
                Toevoegen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent className="bg-card border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Weet je zeker dat je {companyToDelete?.name} wilt verwijderen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Dit verwijdert ook alle bijbehorende blog instellingen. Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white">
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmAdd} onOpenChange={(open) => { if (!open && !isCreating) { setShowConfirmAdd(false); } }}>
        <AlertDialogContent className="bg-card border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Bedrijf toevoegen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Weet je zeker dat je <strong className="text-white/80">{newCompanyName}</strong> ({newCompanyDomain}) wilt toevoegen? De bijbehorende documenten worden automatisch aangemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white" disabled={isCreating}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmAdd();
              }}
              disabled={isCreating}
              className="bg-[#cfddd0] hover:bg-[#bccfbd] text-gray-900"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Bezig met aanmaken...
                </>
              ) : 'Bevestigen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompanySelector;

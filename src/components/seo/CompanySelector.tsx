import { useState, useEffect } from 'react';
import { ChevronDown, Building2, Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  seo_research_webhook: string;
  subkeywords_webhook: string;
  blogs_webhook: string | null;
  auth_token_secret_name: string | null;
  seo_research_n8n_name: string | null;
  subkeywords_n8n_name: string | null;
  blogs_n8n_name: string | null;
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
  const [newCompany, setNewCompany] = useState({
    name: '',
    seo_research_webhook: '',
    subkeywords_webhook: '',
    blogs_webhook: '',
    auth_token_secret_name: '',
    seo_research_n8n_name: '',
    subkeywords_n8n_name: '',
    blogs_n8n_name: '',
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
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

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.seo_research_webhook || !newCompany.subkeywords_webhook) {
      toast({
        title: 'Vul alle verplichte velden in',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          seo_research_webhook: newCompany.seo_research_webhook,
          subkeywords_webhook: newCompany.subkeywords_webhook,
          blogs_webhook: newCompany.blogs_webhook || null,
          auth_token_secret_name: newCompany.auth_token_secret_name || null,
          seo_research_n8n_name: newCompany.seo_research_n8n_name || null,
          subkeywords_n8n_name: newCompany.subkeywords_n8n_name || null,
          blogs_n8n_name: newCompany.blogs_n8n_name || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Bedrijf toegevoegd',
        description: `${newCompany.name} is succesvol aangemaakt`,
      });

      // Reset form and close dialog
      setNewCompany({
        name: '',
        seo_research_webhook: '',
        subkeywords_webhook: '',
        blogs_webhook: '',
        auth_token_secret_name: '',
        seo_research_n8n_name: '',
        subkeywords_n8n_name: '',
        blogs_n8n_name: '',
      });
      setIsDialogOpen(false);

      // Refresh companies and select the new one
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
      setIsSaving(false);
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
            className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white gap-2"
          >
            <Building2 className="w-4 h-4" />
            {selectedCompany?.name || 'Selecteer bedrijf'}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-slate-900 border-white/20 min-w-[200px] z-50"
        >
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleSelectCompany(company)}
              className={`text-white/80 hover:text-white hover:bg-white/10 cursor-pointer ${
                selectedCompany?.id === company.id ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              {company.name}
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
        <DialogContent className="bg-slate-900 border-white/20 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Nieuw bedrijf toevoegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white/70">Bedrijfsnaam *</Label>
              <Input
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Naam van het bedrijf"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">SEO Research Webhook URL *</Label>
              <Input
                value={newCompany.seo_research_webhook}
                onChange={(e) => setNewCompany({ ...newCompany, seo_research_webhook: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Subzoekwoorden Webhook URL *</Label>
              <Input
                value={newCompany.subkeywords_webhook}
                onChange={(e) => setNewCompany({ ...newCompany, subkeywords_webhook: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Blogs Webhook URL</Label>
              <Input
                value={newCompany.blogs_webhook}
                onChange={(e) => setNewCompany({ ...newCompany, blogs_webhook: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Auth Token Secret Name</Label>
              <Input
                value={newCompany.auth_token_secret_name}
                onChange={(e) => setNewCompany({ ...newCompany, auth_token_secret_name: e.target.value })}
                placeholder="bijv. N8N_WEBHOOK_AUTH_TOKEN"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/50 mb-3">N8N Workflow namen (optioneel)</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">SEO Research N8N naam</Label>
                  <Input
                    value={newCompany.seo_research_n8n_name}
                    onChange={(e) => setNewCompany({ ...newCompany, seo_research_n8n_name: e.target.value })}
                    placeholder="bijv. BEDRIJF SEO research"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Subzoekwoorden N8N naam</Label>
                  <Input
                    value={newCompany.subkeywords_n8n_name}
                    onChange={(e) => setNewCompany({ ...newCompany, subkeywords_n8n_name: e.target.value })}
                    placeholder="bijv. BEDRIJF subzoekwoorden"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Blogs N8N naam</Label>
                  <Input
                    value={newCompany.blogs_n8n_name}
                    onChange={(e) => setNewCompany({ ...newCompany, blogs_n8n_name: e.target.value })}
                    placeholder="bijv. BEDRIJF blogs"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleAddCompany}
                disabled={isSaving || !newCompany.name || !newCompany.seo_research_webhook || !newCompany.subkeywords_webhook}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? 'Toevoegen...' : 'Toevoegen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanySelector;

import { useState, useEffect } from 'react';
import { Building2, Save, Workflow, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Company {
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

export const CompaniesTab = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localChanges, setLocalChanges] = useState<Record<string, Partial<Company>>>({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Fout bij laden van bedrijven');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (companyId: string, field: keyof Company, value: string) => {
    setLocalChanges(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [field]: value || null,
      }
    }));
  };

  const getFieldValue = (company: Company, field: keyof Company): string => {
    const localValue = localChanges[company.id]?.[field];
    if (localValue !== undefined) return localValue || '';
    return (company[field] as string) || '';
  };

  const hasChanges = (companyId: string): boolean => {
    return Object.keys(localChanges[companyId] || {}).length > 0;
  };

  const handleSave = async (company: Company) => {
    setSavingId(company.id);
    try {
      const updates = localChanges[company.id];
      if (!updates) return;

      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id);

      if (error) throw error;

      // Update local state
      setCompanies(prev => prev.map(c => 
        c.id === company.id ? { ...c, ...updates } : c
      ));
      
      // Clear local changes for this company
      setLocalChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[company.id];
        return newChanges;
      });

      toast.success(`${company.name} bijgewerkt`);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Fout bij opslaan');
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Bedrijven & Webhooks</h2>
        <p className="text-muted-foreground text-sm">
          Beheer de webhook URLs en N8N workflow namen per bedrijf.
        </p>
      </div>

      <div className="grid gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="bg-card/50 border-border/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                {company.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* N8N Workflow Namen */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  N8N Workflow Namen
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`seo-n8n-${company.id}`}>SEO Onderzoek</Label>
                    <Input
                      id={`seo-n8n-${company.id}`}
                      value={getFieldValue(company, 'seo_research_n8n_name')}
                      onChange={(e) => handleChange(company.id, 'seo_research_n8n_name', e.target.value)}
                      className="bg-background/50 font-mono text-sm"
                      placeholder="bijv. MEDIABIRDS seo research"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subkeywords-n8n-${company.id}`}>Subzoekwoorden</Label>
                    <Input
                      id={`subkeywords-n8n-${company.id}`}
                      value={getFieldValue(company, 'subkeywords_n8n_name')}
                      onChange={(e) => handleChange(company.id, 'subkeywords_n8n_name', e.target.value)}
                      className="bg-background/50 font-mono text-sm"
                      placeholder="bijv. MEDIABIRDS subkeywords"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`blogs-n8n-${company.id}`}>Blogs</Label>
                    <Input
                      id={`blogs-n8n-${company.id}`}
                      value={getFieldValue(company, 'blogs_n8n_name')}
                      onChange={(e) => handleChange(company.id, 'blogs_n8n_name', e.target.value)}
                      className="bg-background/50 font-mono text-sm"
                      placeholder="bijv. MEDIABIRDS blogs"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook URLs (read-only display) */}
              <div className="border-t border-border/30 pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Webhook URLs
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">SEO Onderzoek Webhook</Label>
                    <Input
                      value={company.seo_research_webhook || ''}
                      className="bg-background/30 font-mono text-xs"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Subzoekwoorden Webhook</Label>
                    <Input
                      value={company.subkeywords_webhook || ''}
                      className="bg-background/30 font-mono text-xs"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Blogs Webhook</Label>
                    <Input
                      value={company.blogs_webhook || ''}
                      className="bg-background/30 font-mono text-xs"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Auth Token Secret</Label>
                    <Input
                      value={company.auth_token_secret_name || ''}
                      className="bg-background/30 font-mono text-xs"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {hasChanges(company.id) && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleSave(company)}
                    disabled={savingId === company.id}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingId === company.id ? 'Opslaan...' : 'Wijzigingen opslaan'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

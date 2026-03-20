import { useState, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface Company {
  id: string;
  name: string;
  seo_research_webhook: string;
  subkeywords_webhook: string;
  blogs_webhook: string | null;
}

interface CompanySelectorProps {
  selectedCompany: Company | null;
  onCompanyChange: (company: Company) => void;
}

const CompanySelector = ({ selectedCompany, onCompanyChange }: CompanySelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    fetchCompanies();
  }, []);

  const handleSelectCompany = (company: Company) => {
    localStorage.setItem('selectedCompanyId', company.id);
    onCompanyChange(company);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-white/50 text-sm">Laden...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return null;
  }

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CompanySelector;
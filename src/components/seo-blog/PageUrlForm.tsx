import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Info } from 'lucide-react';
import { usePageUrlSettings } from '@/hooks/usePageUrlSettings';
import { Company } from '@/components/seo/CompanySelector';
import { User } from '@supabase/supabase-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PageUrlFormProps {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  isAdmin: boolean;
  user: User | null;
  saveNotification: (message: string, status: 'success' | 'error') => Promise<void>;
}

export const PageUrlForm = ({
  selectedCompany,
  isAdmin,
  saveNotification,
}: PageUrlFormProps) => {
  const { settings, isLoading, isSaving, saveSettings } = usePageUrlSettings(
    selectedCompany?.id || null
  );

  const [googleSheetId, setGoogleSheetId] = useState('');
  const [googleFileId, setGoogleFileId] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);

  // Sync local state with loaded settings
  useEffect(() => {
    if (settings) {
      setGoogleSheetId(settings.google_sheet_id || '');
      setGoogleFileId(settings.google_file_id || '');
      
      const urlEntries = Object.entries(settings.page_urls || {});
      if (urlEntries.length > 0) {
        // Sort by key and extract values
        const sortedUrls = urlEntries
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, url]) => url);
        setUrls(sortedUrls);
      } else {
        setUrls(['']);
      }
    }
  }, [settings]);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleRemoveUrl = (index: number) => {
    if (urls.length === 1) {
      setUrls(['']);
    } else {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSave = async () => {
    // Convert array to numbered object
    const pageUrls: Record<string, string> = {};
    urls.forEach((url, index) => {
      if (url.trim()) {
        pageUrls[(index + 1).toString()] = url.trim();
      }
    });

    const result = await saveSettings({
      google_sheet_id: googleSheetId,
      google_file_id: googleFileId,
      page_urls: pageUrls,
    });

    if (result.success) {
      await saveNotification('Pagina URL instellingen opgeslagen', 'success');
    } else {
      await saveNotification('Fout bij opslaan van instellingen', 'error');
    }
  };

  // Validation: at least one URL must be filled
  const hasValidUrl = urls.some(url => url.trim().length > 0);

  if (!selectedCompany) {
    return (
      <div className="text-center py-8 text-white/50">
        Selecteer eerst een bedrijf om de pagina URL instellingen te beheren
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Pagina URL Instellingen</h2>
      
      {/* Bedrijfsnaam - Read only with gradient border */}
      <div className="space-y-2">
        <Label className="text-white/70">Bedrijfsnaam</Label>
        <div className="px-3 py-2 rounded-md bg-white/5 border-2 border-transparent text-white/80 h-[40px] flex items-center overflow-hidden whitespace-nowrap text-ellipsis [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]">
          {selectedCompany.name}
        </div>
      </div>

      {/* Spreadsheet ID */}
      <div className="space-y-2">
        <Label className="text-white/70">Spreadsheet ID</Label>
        <Input
          value={googleSheetId}
          onChange={(e) => setGoogleSheetId(e.target.value)}
          placeholder="Voer Spreadsheet ID in..."
          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          disabled={!isAdmin}
        />
      </div>

      {/* Grid ID */}
      <div className="space-y-2">
        <Label className="text-white/70">Grid ID</Label>
        <Input
          value={googleFileId}
          onChange={(e) => setGoogleFileId(e.target.value)}
          placeholder="Voer Grid ID in..."
          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          disabled={!isAdmin}
        />
      </div>

      {/* Dynamic URL Fields */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-white/70">Pagina URLs</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-white/40 hover:text-white/70 cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px] bg-background border-white/20">
              <p className="text-sm">De site moet een xml sitemap hebben om dit veld in te vullen. Aanwezig: pak de belangrijkste links waar de pagina's onder vallen waarvan je de info wilt documenteren, zodat de ai agent interne links kan leggen naar deze pagina's.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm min-w-[50px]">URL {index + 1}</span>
                <Input
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            {isAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveUrl(index)}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {isAdmin && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddUrl}
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            URL toevoegen
          </Button>
        )}
      </div>

      {/* Save/Start Button */}
      {isAdmin && (
        <Button
          onClick={handleSave}
          disabled={!hasValidUrl || isSaving}
          variant="primaryCustom"
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Opslaan...
            </>
          ) : (
            'Opslaan'
          )}
        </Button>
      )}
    </div>
  );
};

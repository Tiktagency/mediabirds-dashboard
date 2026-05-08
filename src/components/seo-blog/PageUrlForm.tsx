import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Info, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePageUrlSettings } from '@/hooks/usePageUrlSettings';
import { Company } from '@/components/seo/CompanySelector';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/ce22d18b-67ef-4e24-aa76-a9f94ec69986';

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
  const { toast } = useToast();

  const [googleSheetId, setGoogleSheetId] = useState('');
  const [googleFileId, setGoogleFileId] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false);

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

  // Auto-save helper function
  const autoSave = async (field: 'google_sheet_id' | 'google_file_id' | 'page_urls', value: string | Record<string, string>) => {
    const result = await saveSettings({ [field]: value });
    if (result.success) {
      toast({
        title: 'Opgeslagen',
        description: 'Wijzigingen zijn automatisch opgeslagen',
      });
    }
  };

  const handleSpreadsheetIdBlur = () => {
    if (googleSheetId !== (settings?.google_sheet_id || '')) {
      autoSave('google_sheet_id', googleSheetId);
    }
  };

  const handleGridIdBlur = () => {
    if (googleFileId !== (settings?.google_file_id || '')) {
      autoSave('google_file_id', googleFileId);
    }
  };

  const handleUrlBlur = () => {
    const pageUrls: Record<string, string> = {};
    urls.forEach((url, index) => {
      if (url.trim()) {
        pageUrls[(index + 1).toString()] = url.trim();
      }
    });
    
    const currentUrls = settings?.page_urls || {};
    if (JSON.stringify(pageUrls) !== JSON.stringify(currentUrls)) {
      autoSave('page_urls', pageUrls);
    }
  };

  const handleTriggerWebhook = async () => {
    if (!selectedCompany) return;

    setIsSubmitting(true);
    try {
      // First save all current data
      const pageUrls: Record<string, string> = {};
      urls.forEach((url, index) => {
        if (url.trim()) {
          pageUrls[(index + 1).toString()] = url.trim();
        }
      });

      await saveSettings({
        google_sheet_id: googleSheetId,
        google_file_id: googleFileId,
        page_urls: pageUrls,
      });

      // Send POST request to webhook - array format with URLs object and Document IDs object
      const payload = [
        // Object 1: Genummerde URL's
        urls.reduce((acc, url, index) => {
          if (url.trim()) {
            acc[(index + 1).toString()] = url.trim();
          }
          return acc;
        }, {} as Record<string, string>),
        // Object 2: Document IDs en bedrijfsnaam
        {
          "Document ID": googleSheetId,
          "Slide ID": googleFileId,
          "bedrijfsnaam": selectedCompany.name,
        }
      ];

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let message = responseText;
      
      try {
        const jsonResponse = JSON.parse(responseText);
        message = jsonResponse.message || jsonResponse.Output || jsonResponse.output || responseText;
      } catch {
        // Use raw text if not JSON
      }

      if (response.ok) {
        await saveNotification(message || 'URL documentatie gestart', 'success');
      } else {
        await saveNotification(`Fout: ${message}`, 'error');
      }
    } catch (error) {
      console.error('Webhook error:', error);
      await saveNotification('Fout bij het starten van documentatie', 'error');
    } finally {
      setIsSubmitting(false);
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
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">Pagina URL Instellingen</h2>
        <p className="text-sm text-white/50 mt-1">Beheer sitemap URLs voor interne linkbuilding</p>
      </div>
      
      {/* Bedrijfsnaam - Read only with gradient border */}
      <div className="space-y-2">
        <Label className="text-white/70">Bedrijfsnaam</Label>
        <div className="px-3 py-2 rounded-md bg-white/5 border-2 border-transparent text-white/80 h-[40px] flex items-center overflow-hidden whitespace-nowrap text-ellipsis [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]">
          {selectedCompany.name}
        </div>
      </div>

      {/* Dynamic URL Fields */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-white/70">Pagina URLs</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-white/50 hover:text-white/70 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-background border border-white/20 text-white p-3">
                <p className="text-sm">
                  De site moet een xml sitemap hebben om dit veld in te vullen. 
                  Aanwezig: pak de belangrijkste links waar de pagina's onder vallen 
                  waarvan je de info wilt documenteren, zodat de ai agent interne 
                  links kan leggen naar deze pagina's.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm min-w-[50px]">URL {index + 1}</span>
                <Input
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  onBlur={handleUrlBlur}
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
                className="text-white/50 hover:text-white"
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
            className="w-full bg-white/5 border-white/20 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            URL toevoegen
          </Button>
        )}
      </div>

      {/* Admin Settings Collapsible */}
      {isAdmin && (
        <Collapsible 
          open={adminSettingsOpen} 
          onOpenChange={setAdminSettingsOpen}
          className="pt-6 border-t border-white/10"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-white/5 rounded-md px-2 transition-colors">
            <p className="text-sm text-yellow-400/80 font-medium">Admin instellingen</p>
            <ChevronDown className={cn(
              "h-4 w-4 text-yellow-400/80 transition-transform duration-200",
              adminSettingsOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Spreadsheet ID */}
            <div className="space-y-2">
              <Label className="text-white/70">Spreadsheet ID</Label>
              <Input
                value={googleSheetId}
                onChange={(e) => setGoogleSheetId(e.target.value)}
                onBlur={handleSpreadsheetIdBlur}
                placeholder="Voer Spreadsheet ID in..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
            {/* Grid ID */}
            <div className="space-y-2">
              <Label className="text-white/70">Grid ID</Label>
              <Input
                value={googleFileId}
                onChange={(e) => setGoogleFileId(e.target.value)}
                onBlur={handleGridIdBlur}
                placeholder="Voer Grid ID in..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Webhook Trigger Button */}
      {isAdmin && (
        <Button
          onClick={handleTriggerWebhook}
          disabled={!hasValidUrl || isSubmitting}
          variant="primaryCustom"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Bezig...
            </>
          ) : (
            "URL's documenteren"
          )}
        </Button>
      )}
    </div>
  );
};

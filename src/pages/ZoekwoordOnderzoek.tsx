import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, X, Pencil, Check, XCircle, Sparkles, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CompanySelector, { Company } from '@/components/seo/CompanySelector';
import { useSeoSettings } from '@/hooks/useSeoSettings';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: 'success' | 'error';
}

const FIXED_SEO_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/b932bfda-0727-4ff4-b311-b234be0ff953';
const FIXED_SUBKEYWORDS_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/64e96f60-f941-4cd6-8f14-a9ab91c9dc67';

const ZoekwoordOnderzoek = () => {
  const { toast, dismiss } = useToast();
  const { isLoading: authLoading, user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubkeywordsLoading, setIsSubkeywordsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [lastReadTime, setLastReadTime] = useState<string | null>(
    localStorage.getItem('notifications_last_read')
  );

  // Form state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    blog_onderwerp: '',
    doelgroep_intentie: '',
    bedrijfsomschrijving: '',
    extra_instructies: '',
  });

  // Click outside handler to collapse expanded field
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedField && !(e.target as Element).closest('.expanded-field-container')) {
        setExpandedField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedField]);

  const { settings, isLoading: settingsLoading, saveSettings } = useSeoSettings(selectedCompany?.id || null);

  // Load settings into form when they change
  useEffect(() => {
    if (settings) {
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: settings.blog_onderwerp || '',
        doelgroep_intentie: settings.doelgroep_intentie || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        extra_instructies: settings.extra_instructies || '',
      });
    } else {
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: '',
        doelgroep_intentie: '',
        bedrijfsomschrijving: '',
        extra_instructies: '',
      });
    }
    setEditingField(null);
  }, [settings, selectedCompany]);

  // Load notifications from database
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data as Notification[]);
      }
    };

    loadNotifications();

    const channel = supabase
      .channel('notifications_channel_seo')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center seo-page-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(
    n => !lastReadTime || new Date(n.created_at) > new Date(lastReadTime)
  ).length;

  const handlePanelToggle = () => {
    if (!isPanelOpen) {
      const now = new Date().toISOString();
      setLastReadTime(now);
      localStorage.setItem('notifications_last_read', now);
      dismiss();
    }
    setIsPanelOpen(!isPanelOpen);
  };

  const saveNotification = async (message: string, status: 'success' | 'error') => {
    if (!user) return;
    
    await supabase.from('notifications').insert({
      message,
      status,
      user_id: user.id,
    });
  };

  const isFormComplete = () => {
    // Required fields: blog_onderwerp, doelgroep_intentie, bedrijfsomschrijving
    // extra_instructies is optional
    return (
      formData.blog_onderwerp.trim() !== '' &&
      formData.doelgroep_intentie.trim() !== '' &&
      formData.bedrijfsomschrijving.trim() !== ''
    );
  };

  const handleSaveField = async (field: string) => {
    // Special handling for bedrijfsnaam - update companies table
    if (field === 'bedrijfsnaam' && selectedCompany) {
      const { error: companyError } = await supabase
        .from('companies')
        .update({ name: formData.bedrijfsnaam })
        .eq('id', selectedCompany.id);
      
      if (!companyError) {
        // Update the selectedCompany state to reflect the new name
        setSelectedCompany(prev => prev ? { ...prev, name: formData.bedrijfsnaam } : null);
        toast({
          title: "Opgeslagen",
          description: "Bedrijfsnaam succesvol opgeslagen",
          duration: 3000,
        });
        setEditingField(null);
      } else {
        toast({
          title: "Fout",
          description: "Kon bedrijfsnaam niet opslaan",
          variant: "destructive",
          duration: 5000,
        });
      }
      return;
    }

    const updateData: any = {
      [field]: formData[field as keyof typeof formData] || null,
    };

    const result = await saveSettings(updateData);
    
    if (result.success) {
      toast({
        title: "Opgeslagen",
        description: "Veld succesvol opgeslagen",
        duration: 3000,
      });
      setEditingField(null);
    } else {
      toast({
        title: "Fout",
        description: result.error || "Kon niet opslaan",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset to saved values
    if (settings) {
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: settings.blog_onderwerp || '',
        doelgroep_intentie: settings.doelgroep_intentie || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        extra_instructies: settings.extra_instructies || '',
      });
    }
    setEditingField(null);
  };

  const handleStartResearch = async () => {
    if (!isFormComplete() || !selectedCompany) {
      toast({
        title: "Fout",
        description: "Vul eerst alle verplichte velden in",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('trigger-seo-webhook', {
        body: {
          webhookUrl: FIXED_SEO_WEBHOOK_URL,
          authTokenSecretName: 'SEO_WEBHOOK_AUTH_TOKEN',
          action: 'research',
          formData: {
            bedrijfsnaam: formData.bedrijfsnaam,
            blogTopic: formData.blog_onderwerp,
            audienceIntent: formData.doelgroep_intentie,
            businessDescription: formData.bedrijfsomschrijving,
            extraInstructions: formData.extra_instructies,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        // Only show toast if there's an actual message from the webhook
        if (data.hasMessage && data.message) {
          toast({
            title: 'SEO Onderzoek voltooid',
            description: data.message,
            duration: 7000,
          });
        }
        // If no message, the automation is still running - notification will come via realtime
      } else {
        throw new Error(data.error || 'Webhook request failed');
      }
    } catch (error) {
      console.error('Error submitting SEO research:', error);
      toast({
        title: 'Er is iets misgegaan',
        description: 'Het SEO onderzoek kon niet worden gestart. Probeer het opnieuw.',
        variant: 'destructive',
        duration: 7000,
      });
      // Error notification is already saved by the edge function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubzoekwoorden = async () => {
    if (!selectedCompany) return;
    
    setIsSubkeywordsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('trigger-seo-webhook', {
        body: {
          webhookUrl: FIXED_SUBKEYWORDS_WEBHOOK_URL,
          authTokenSecretName: 'SEO_WEBHOOK_AUTH_TOKEN',
          action: 'subkeywords',
          formData: {
            bedrijfsnaam: selectedCompany.name,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        // Only show toast if there's an actual message from the webhook
        if (data.hasMessage && data.message) {
          toast({
            title: 'Subzoekwoorden voltooid',
            description: data.message,
            duration: 7000,
          });
        }
        // If no message, the automation is still running - notification will come via realtime
      } else {
        throw new Error(data.error || 'Webhook request failed');
      }
    } catch (error) {
      console.error('Error triggering subzoekwoorden:', error);
      toast({
        title: 'Er is iets misgegaan',
        description: 'De subzoekwoorden konden niet worden gestart. Probeer het opnieuw.',
        variant: 'destructive',
        duration: 7000,
      });
      // Error notification is already saved by the edge function
    } finally {
      setIsSubkeywordsLoading(false);
    }
  };

  const renderInputField = (
    label: string,
    field: keyof typeof formData,
    hasGradientBorder: boolean = false
  ) => {
    const isEditing = editingField === field;
    const isExpanded = expandedField === field;
    const value = formData[field];
    const canEdit = isAdmin;

    return (
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">{label}</Label>
        
        {isEditing && canEdit ? (
          // EDITING MODE
          <div className="flex gap-2 items-center">
            <Input
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => handleSaveField(field)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleCancelEdit}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : isExpanded ? (
          // EXPANDED MODE - show text + pencil inside
          <div className="expanded-field-container relative">
            <div className={`px-3 py-2 pr-12 rounded-md text-white/80 min-h-[40px] ${
              hasGradientBorder 
                ? 'bg-white/5 border-2 border-transparent [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]' 
                : 'bg-white/5 border border-white/10'
            }`}>
              {value || <span className="text-white/40 italic">Niet ingesteld</span>}
            </div>
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedField(null);
                  setEditingField(field);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // COLLAPSED MODE - clickable to expand
          <div 
            className={`px-3 py-2 rounded-md text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors ${
              hasGradientBorder 
                ? 'bg-white/5 border-2 border-transparent [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]' 
                : 'bg-white/5 border border-white/10'
            }`}
            onClick={() => setExpandedField(field)}
          >
            {value || <span className="text-white/40 italic">Niet ingesteld</span>}
          </div>
        )}
      </div>
    );
  };

  const renderTextField = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    optional: boolean = false
  ) => {
    const isEditing = editingField === field;
    const isExpanded = expandedField === field;
    const value = formData[field];
    const canEdit = isAdmin;

    // Auto-resize textarea when editing
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white/70 text-sm">{label}</Label>
          {optional && (
            <span className="text-xs text-white/40">(Optioneel)</span>
          )}
        </div>
        
        {isEditing && canEdit ? (
          // EDITING MODE
          <div className="flex gap-2 items-start">
            <Textarea
              value={value}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => handleSaveField(field)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleCancelEdit}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : isExpanded ? (
          // EXPANDED MODE - show all text + pencil inside
          <div className="expanded-field-container relative">
            <div className="px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/10 text-white/80 whitespace-pre-wrap min-h-[40px]">
              {value || <span className="text-white/40 italic">Niet ingesteld</span>}
            </div>
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedField(null);
                  setEditingField(field);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // COLLAPSED MODE - fixed height, clickable to expand
          <div 
            className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setExpandedField(field)}
          >
            {value || <span className="text-white/40 italic">Niet ingesteld</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen seo-page-gradient">
      {/* Top navigation bar */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <CompanySelector 
            selectedCompany={selectedCompany} 
            onCompanyChange={setSelectedCompany} 
          />
          
          {/* Notification Bell */}
          <button
            onClick={handlePanelToggle}
            className="relative p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors"
          >
            <Bell className="h-5 w-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-card/95 backdrop-blur-lg border-l border-border/50 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Notificaties</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePanelToggle}
            className="text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-white/50 text-center py-8">Geen notificaties</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.status === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <p className="text-sm text-white/90">{notification.message}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {format(new Date(notification.created_at), 'PPpp', { locale: nl })}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="w-full flex flex-col items-center justify-start pt-24 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Zoekwoord Onderzoek
        </h1>
        <p className="text-white/50 text-lg mb-12 text-center max-w-lg">
          Vul de gegevens in om een AI-gestuurd SEO zoekwoordonderzoek te starten
        </p>
        
        {selectedCompany ? (
          <div className="w-full max-w-2xl mx-auto">
            <div className="seo-card p-8 md:p-10 animate-fade-in space-y-6">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <>
                  {/* Form Fields */}
                  {renderInputField('Bedrijf', 'bedrijfsnaam', true)}
                  
                  {renderTextField(
                    'Blog Onderwerp',
                    'blog_onderwerp',
                    'Bijv. duurzame energie, digitale marketing, gezonde voeding...'
                  )}
                  
                  {renderTextField(
                    'Doelgroep & Intentie',
                    'doelgroep_intentie',
                    'Bijv. MKB-ondernemers die hun online zichtbaarheid willen vergroten...'
                  )}
                  
                  {renderTextField(
                    'Bedrijfsomschrijving',
                    'bedrijfsomschrijving',
                    'Bijv. Wij zijn een full-service marketing bureau gespecialiseerd in...'
                  )}
                  
                  {renderTextField(
                    'Extra Instructies',
                    'extra_instructies',
                    'Bijv. Focus op Nederlandse markt, vermijd technisch jargon...',
                    true
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <Button
                      onClick={handleStartResearch}
                      disabled={isSubmitting || !isFormComplete()}
                      className="w-full seo-button-primary gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bezig...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Start SEO onderzoek - {selectedCompany.name}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleSubzoekwoorden}
                      disabled={isSubkeywordsLoading}
                      variant="outline"
                      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 gap-2"
                    >
                      {isSubkeywordsLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bezig...
                        </>
                      ) : (
                        <>
                          <GitBranch className="w-4 h-4" />
                          Subzoekwoorden - {selectedCompany.name}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-white/50 text-center">
            <p>Selecteer een bedrijf rechtsboven om te beginnen...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoekwoordOnderzoek;

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Bell, X, Pencil, Check, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CompanySelector, { Company } from '@/components/seo/CompanySelector';
import { useBlogSettings } from '@/hooks/useBlogSettings';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: 'success' | 'error';
}

const FIXED_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/491808f1-aaa2-44fb-88bf-50e0c16f17ac';

const TAAL_OPTIONS = [
  { value: 'Nederlands', label: 'Nederlands' },
  { value: 'Engels', label: 'Engels' },
  { value: 'Duits', label: 'Duits' },
  { value: 'Frans', label: 'Frans' },
  { value: 'Spaans', label: 'Spaans' },
];

const Blogs = () => {
  const { toast, dismiss } = useToast();
  const { isLoading: authLoading, user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [lastReadTime, setLastReadTime] = useState<string | null>(
    localStorage.getItem('notifications_last_read')
  );

  // Form state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    bedrijfsomschrijving: '',
    schrijfstijl: '',
    aantal_woorden: [500, 1500] as [number, number], // Range slider values
    taal: '',
    afbeelding_prompt: '',
    get_afbeelding_url: '',
    post_blog_url: '',
  });

  const { settings, isLoading: settingsLoading, saveSettings } = useBlogSettings(selectedCompany?.id || null);

  // Helper to parse range string to array
  const parseRangeString = (rangeStr: string | null): [number, number] => {
    if (!rangeStr) return [500, 1500];
    const parts = rangeStr.split('-');
    if (parts.length === 2) {
      return [parseInt(parts[0]) || 500, parseInt(parts[1]) || 1500];
    }
    return [500, 1500];
  };

  // Load settings into form when they change
  useEffect(() => {
    if (settings) {
      setFormData({
        bedrijfsnaam: settings.bedrijfsnaam || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        schrijfstijl: settings.schrijfstijl || '',
        aantal_woorden: parseRangeString(settings.aantal_woorden),
        taal: settings.taal || '',
        afbeelding_prompt: settings.afbeelding_prompt || '',
        get_afbeelding_url: settings.get_afbeelding_url || '',
        post_blog_url: settings.post_blog_url || '',
      });
    } else {
      setFormData({
        bedrijfsnaam: '',
        bedrijfsomschrijving: '',
        schrijfstijl: '',
        aantal_woorden: [500, 1500],
        taal: '',
        afbeelding_prompt: '',
        get_afbeelding_url: '',
        post_blog_url: '',
      });
    }
    setEditingField(null);
  }, [settings]);

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
      .channel('notifications_channel')
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
      <div className="min-h-screen flex items-center justify-center">
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
    const requiredStringFields = ['bedrijfsnaam', 'bedrijfsomschrijving', 'schrijfstijl', 'taal'];
    const adminFields = ['afbeelding_prompt', 'get_afbeelding_url', 'post_blog_url'];
    
    for (const field of requiredStringFields) {
      if (!formData[field as keyof typeof formData]) return false;
    }
    
    // Check range slider has valid values
    if (!formData.aantal_woorden || formData.aantal_woorden.length !== 2) return false;
    
    // Admin fields must also be filled (they're stored in DB by admin)
    for (const field of adminFields) {
      if (!formData[field as keyof typeof formData]) return false;
    }
    
    return true;
  };

  const handleSaveField = async (field: string) => {
    const updateData: any = {};
    
    if (field === 'aantal_woorden') {
      // Convert array to string format "min-max"
      updateData[field] = `${formData.aantal_woorden[0]}-${formData.aantal_woorden[1]}`;
    } else {
      updateData[field] = formData[field as keyof typeof formData] || null;
    }

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
        bedrijfsnaam: settings.bedrijfsnaam || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        schrijfstijl: settings.schrijfstijl || '',
        aantal_woorden: parseRangeString(settings.aantal_woorden),
        taal: settings.taal || '',
        afbeelding_prompt: settings.afbeelding_prompt || '',
        get_afbeelding_url: settings.get_afbeelding_url || '',
        post_blog_url: settings.post_blog_url || '',
      });
    }
    setEditingField(null);
  };

  const handleStartClick = async () => {
    if (!isFormComplete()) {
      toast({
        title: "Fout",
        description: "Vul eerst alle velden in",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bedrijfsnaam: formData.bedrijfsnaam,
        bedrijfsomschrijving: formData.bedrijfsomschrijving,
        schrijfstijl: formData.schrijfstijl,
        aantal_woorden: `${formData.aantal_woorden[0]}-${formData.aantal_woorden[1]}`,
        taal: formData.taal,
        afbeelding_prompt: formData.afbeelding_prompt,
        get_afbeelding_url: formData.get_afbeelding_url,
        post_blog_url: formData.post_blog_url,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase.functions.invoke('trigger-blog-generation', {
        body: { 
          webhookUrl: FIXED_WEBHOOK_URL,
          blogData: payload,
        },
      });

      if (error) throw error;

      if (data.success) {
        const message = data.message || "Blog generatie succesvol gestart";
        toast({
          title: "Succes!",
          description: message,
          duration: 10000,
        });
        await saveNotification(message, 'success');
      } else {
        const message = data.error || "Er is iets misgegaan";
        toast({
          title: "Fout",
          description: message,
          duration: 10000,
          variant: "destructive",
        });
        await saveNotification(message, 'error');
      }
    } catch (error) {
      console.error("Error calling Edge Function:", error);
      const errorMessage = "Er is iets misgegaan. Probeer het opnieuw.";
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      await saveNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    field: 'bedrijfsnaam' | 'bedrijfsomschrijving' | 'schrijfstijl' | 'taal' | 'afbeelding_prompt' | 'get_afbeelding_url' | 'post_blog_url',
    label: string,
    type: 'text' | 'textarea' | 'select' = 'text',
    adminOnly: boolean = false
  ) => {
    const isEditing = editingField === field;
    const value = formData[field];
    const canEdit = adminOnly ? isAdmin : isAdmin;
    const isScrollableTextarea = type === 'textarea';

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-white/90">{label}</Label>
          {adminOnly && (
            <span className="text-xs text-yellow-400/80 bg-yellow-400/10 px-2 py-0.5 rounded">Admin only</span>
          )}
        </div>
        
        {isEditing && canEdit ? (
          <div className="flex gap-2">
            {type === 'textarea' ? (
              <Textarea
                value={value}
                onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 max-h-[100px] overflow-y-auto resize-none"
                rows={3}
              />
            ) : type === 'select' ? (
              <Select
                value={value}
                onValueChange={(val) => setFormData(prev => ({ ...prev, [field]: val }))}
              >
                <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecteer..." />
                </SelectTrigger>
                <SelectContent>
                  {TAAL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="text"
                value={value}
                onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
              onClick={() => handleSaveField(field)}
              disabled={settingsLoading}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={handleCancelEdit}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <div className={`flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 ${
              isScrollableTextarea ? 'max-h-[100px] overflow-y-auto whitespace-pre-wrap' : 'min-h-[40px] flex items-center'
            }`}>
              {value || <span className="text-white/40 italic">Niet ingesteld</span>}
            </div>
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
                onClick={() => setEditingField(field)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRangeField = () => {
    const isEditing = editingField === 'aantal_woorden';
    const [min, max] = formData.aantal_woorden;
    const canEdit = isAdmin;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-white/90">Aantal woorden</Label>
        </div>
        
        {isEditing && canEdit ? (
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={formData.aantal_woorden}
                onValueChange={(value) => setFormData(prev => ({ ...prev, aantal_woorden: value as [number, number] }))}
                min={0}
                max={3000}
                step={50}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>0</span>
              <span>3000</span>
            </div>
            <div className="text-center text-white/80 font-medium">
              {min} - {max} woorden
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="icon"
                variant="ghost"
                className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                onClick={() => handleSaveField('aantal_woorden')}
                disabled={settingsLoading}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={handleCancelEdit}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 min-h-[40px] flex items-center">
              {min} - {max} woorden
            </div>
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setEditingField('aantal_woorden')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <CompanySelector 
          selectedCompany={selectedCompany} 
          onCompanyChange={setSelectedCompany} 
        />
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 relative"
          onClick={handlePanelToggle}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center pt-24 pb-12 px-6 overflow-y-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Blogs
        </h1>

        {!selectedCompany ? (
          <p className="text-white/50 text-center">
            Selecteer een bedrijf rechtsboven om te beginnen...
          </p>
        ) : settingsLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/60">Instellingen laden...</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-4">
            {/* Row 1: Bedrijfsnaam + Taal */}
            <div className="grid grid-cols-2 gap-4">
              <div>{renderField('bedrijfsnaam', 'Bedrijfsnaam')}</div>
              <div>{renderField('taal', 'Taal', 'select')}</div>
            </div>

            {/* Row 2: Bedrijfsomschrijving (full width, scrollable) */}
            {renderField('bedrijfsomschrijving', 'Bedrijfsomschrijving', 'textarea')}

            {/* Row 3: Schrijfstijl + Aantal woorden */}
            <div className="grid grid-cols-2 gap-4">
              <div>{renderField('schrijfstijl', 'Schrijfstijl')}</div>
              <div>{renderRangeField()}</div>
            </div>
            
            {/* Admin-only fields */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-yellow-400/80 mb-4">Admin instellingen</p>
              
              {/* Afbeelding prompt (full width, scrollable) */}
              {renderField('afbeelding_prompt', 'Afbeelding prompt', 'textarea', true)}
              
              {/* URL fields side by side */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>{renderField('get_afbeelding_url', 'POST afbeelding URL', 'text', true)}</div>
                <div>{renderField('post_blog_url', 'POST blog URL', 'text', true)}</div>
              </div>
            </div>

            {/* Start button */}
            <div className="pt-4">
              {isSubmitting && (
                <p className="text-center text-white/80 text-sm mb-4">
                  Dit kan enkele minuten duren, even geduld...
                </p>
              )}
              
              <Button 
                size="lg" 
                className="w-full py-6 text-lg h-auto"
                onClick={handleStartClick}
                disabled={isSubmitting || !isFormComplete()}
              >
                {isSubmitting ? 'Bezig...' : (
                  <>
                    Start <span className="text-sm font-normal opacity-70 ml-2">- {selectedCompany.name}</span>
                  </>
                )}
              </Button>
              
              {!isFormComplete() && (
                <p className="text-center text-white/50 text-sm mt-2">
                  Alle velden moeten ingevuld zijn om te starten
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background border-l shadow-lg transform transition-transform duration-300 z-50 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Meldingen</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Geen meldingen
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.status === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                  }`}
                >
                  <p className="text-sm mb-2 text-gray-900 dark:text-gray-100">{notification.message}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {format(new Date(notification.created_at), 'dd-MM-yyyy HH:mm', { locale: nl })}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay when panel is open */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default Blogs;

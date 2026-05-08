import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, X, Search, FileText, Link as LinkIcon, BookOpen, Lightbulb, FolderOpen, Settings2, PenTool, CheckCircle2, Link2, User, Pencil, Check, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CompanySelector, { Company } from '@/components/seo/CompanySelector';
import { KeywordResearchForm } from '@/components/seo-blog/KeywordResearchForm';
import { BlogGenerationForm } from '@/components/seo-blog/BlogGenerationForm';
import { PageUrlForm } from '@/components/seo-blog/PageUrlForm';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { usePageUrlSettings } from '@/hooks/usePageUrlSettings';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: 'success' | 'error';
}

type ActiveView = 'none' | 'keyword' | 'blog' | 'pageurl';

interface ManagedByUser {
  id: string;
  email: string | null;
}

const SeoBlog = () => {
  const { isLoading: authLoading, user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('none');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<string | null>(
    localStorage.getItem('notifications_last_read')
  );
  const [managedByUsers, setManagedByUsers] = useState<ManagedByUser[]>([]);
  const [managedBy, setManagedBy] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesEditMode, setNotesEditMode] = useState<'expanded' | 'editing'>('expanded');
  const [notesDraft, setNotesDraft] = useState('');
  const { settings: pageUrlSettings, isLoading: pageUrlLoading, isSaving: pageUrlSaving, saveSettings: savePageUrlSettings, reloadSettings: reloadPageUrlSettings } = usePageUrlSettings(selectedCompany?.id || null);

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
      .channel('notifications_channel_seo_blog')
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

  // Fetch admin/operator users for "Beheerd door" dropdown
  useEffect(() => {
    const fetchManagedByUsers = async () => {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'operator', 'super_admin']);

      if (!roleData || roleData.length === 0) return;

      const userIds = roleData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profiles) {
        setManagedByUsers(profiles);
      }
    };

    fetchManagedByUsers();
  }, []);

  // Load managed_by and notes when company changes
  useEffect(() => {
    if (!selectedCompany) {
      setManagedBy(null);
      setNotes('');
      return;
    }
    
    const fetchCompanyData = async () => {
      const { data } = await supabase
        .from('companies')
        .select('managed_by, notes')
        .eq('id', selectedCompany.id)
        .single();

      setManagedBy((data as any)?.managed_by || null);
      setNotes((data as any)?.notes || '');
    };

    fetchCompanyData();
  }, [selectedCompany]);

  const handleSaveNotes = async () => {
    if (!selectedCompany) return;
    setIsSavingNotes(true);
    
    const { error } = await supabase
      .from('companies')
      .update({ notes } as any)
      .eq('id', selectedCompany.id);

    setIsSavingNotes(false);
    
    if (error) {
      toast({ title: 'Fout bij opslaan notities', variant: 'destructive' });
    } else {
      toast({ title: 'Notities opgeslagen' });
    }
  };

  const handleManagedByChange = async (userId: string) => {
    if (!selectedCompany) return;
    
    const value = userId === 'none' ? null : userId;
    setManagedBy(value);

    await supabase
      .from('companies')
      .update({ managed_by: value } as any)
      .eq('id', selectedCompany.id);
  };

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

  return (
    <div className="min-h-screen seo-page-gradient">
      {/* Top navigation bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-white/10">
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
          
          {/* Guide Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="relative p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors"
            title="Handleiding"
          >
            <BookOpen className="h-5 w-5 text-white" />
          </button>
          
          {/* Notification Bell */}
          <button
            onClick={handlePanelToggle}
            className="relative p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors"
          >
            <Bell className="h-5 w-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#cfddd0] text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
      
      <div className="w-full flex flex-col items-center justify-start pt-24 pb-16 px-6 max-w-5xl mx-auto">
        <div className="flex w-full max-w-4xl gap-6 mb-12">
          {/* Left column - title, subtitle, managed by */}
          <div className="flex-1 text-left">
            <h1 className="hero-title text-white mb-4 fade-in-up">
              SEO
            </h1>
            <p className="text-white/50 text-lg mb-4">
              Beheer je zoekwoord onderzoek en blog generatie op één plek
            </p>
            
            {selectedCompany && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-white/40" />
                <span className="text-white/40 text-sm">Beheerd door:</span>
                {isAdmin ? (
                  <Select
                    value={managedBy || 'none'}
                    onValueChange={handleManagedByChange}
                  >
                    <SelectTrigger className="w-[220px] bg-white/5 border-white/20 text-white h-8 text-sm">
                      <SelectValue placeholder="Selecteer beheerder" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/20">
                      <SelectItem value="none" className="text-white/60">Geen</SelectItem>
                      {managedByUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-white/80">
                          {u.email || 'Onbekend'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-white/70 text-sm">
                    {managedByUsers.find(u => u.id === managedBy)?.email || 'Niet ingesteld'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right column - Notes */}
          {selectedCompany && (
            <div className="w-80 bg-white/5 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">Notities</span>
                {notesEditMode === 'expanded' && (
                  <button
                    onClick={() => { setNotesDraft(notes); setNotesEditMode('editing'); }}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    title="Bewerken"
                  >
                    <Pencil className="h-3.5 w-3.5 text-white/60" />
                  </button>
                )}
              </div>

              {notesEditMode === 'expanded' && (
                <div
                  className="text-red-400 text-sm whitespace-pre-wrap min-h-[20px] max-h-[200px] overflow-y-auto"
                >
                  {notes || <span className="text-white/30 italic">Geen notities</span>}
                </div>
              )}

              {notesEditMode === 'editing' && (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Laat hier notities achter voor je collega's..."
                    className="bg-white/5 border-white/10 text-red-400 placeholder:text-white/30 text-sm min-h-[80px] resize-none field-sizing-content"
                    style={{ fieldSizing: 'content' } as React.CSSProperties}
                    autoFocus
                  onBlur={async () => {
                    setNotes(notesDraft);
                    setNotesEditMode('expanded');
                    setIsSavingNotes(true);
                    const { error } = await supabase
                      .from('companies')
                      .update({ notes: notesDraft } as any)
                      .eq('id', selectedCompany.id);
                    setIsSavingNotes(false);
                    if (error) {
                      toast({ title: 'Fout bij opslaan notities', variant: 'destructive' });
                    } else {
                      toast({ title: 'Notities opgeslagen' });
                    }
                  }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mini Dashboard - Arrow-shaped navigation */}
        <div className="flex w-full max-w-4xl mb-12">
          {/* Tile 1: Pagina URL */}
          <button
            onClick={() => setActiveView('pageurl')}
            className={cn(
              "arrow-tile arrow-tile-first flex-1 py-6 px-8 transition-all duration-300",
              activeView === 'pageurl'
                ? "bg-secondary shadow-lg shadow-secondary/20"
                : "bg-[#212122] hover:bg-[#2a2a2b]"
            )}
          >
            <div className="flex items-center gap-4">
              <span className={cn(
                "text-2xl font-bold",
                activeView === 'pageurl' ? "text-secondary-foreground" : "text-white/30"
              )}>
                1
              </span>
              <div className={cn(
                "p-2 rounded-full transition-colors",
                activeView === 'pageurl' ? "bg-secondary-foreground/10" : "bg-white/10"
              )}>
                <LinkIcon className={cn(
                  "h-5 w-5",
                  activeView === 'pageurl' ? "text-secondary-foreground" : "text-white"
                )} />
              </div>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-semibold text-sm",
                  activeView === 'pageurl' ? "text-secondary-foreground" : "text-white"
                )}>
                  Pagina URL
                </span>
                <span className={cn(
                  "text-xs",
                  activeView === 'pageurl' ? "text-secondary-foreground/70" : "text-white/50"
                )}>
                  Sitemap URLs
                </span>
              </div>
            </div>
          </button>

          {/* Tile 2: Zoekwoord Onderzoek */}
          <button
            onClick={() => setActiveView('keyword')}
            className={cn(
              "arrow-tile arrow-tile-middle flex-1 py-6 px-8 transition-all duration-300",
              activeView === 'keyword'
                ? "bg-secondary shadow-lg shadow-secondary/20"
                : "bg-[#212122] hover:bg-[#2a2a2b]"
            )}
          >
            <div className="flex items-center gap-4 pl-4">
              <span className={cn(
                "text-2xl font-bold",
                activeView === 'keyword' ? "text-secondary-foreground" : "text-white/30"
              )}>
                2
              </span>
              <div className={cn(
                "p-2 rounded-full transition-colors",
                activeView === 'keyword' ? "bg-secondary-foreground/10" : "bg-white/10"
              )}>
                <Search className={cn(
                  "h-5 w-5",
                  activeView === 'keyword' ? "text-secondary-foreground" : "text-white"
                )} />
              </div>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-semibold text-sm",
                  activeView === 'keyword' ? "text-secondary-foreground" : "text-white"
                )}>
                  Zoekwoord Onderzoek
                </span>
                <span className={cn(
                  "text-xs",
                  activeView === 'keyword' ? "text-secondary-foreground/70" : "text-white/50"
                )}>
                  AI-gestuurd SEO
                </span>
              </div>
            </div>
          </button>

          {/* Tile 3: Blog Generatie */}
          <button
            onClick={() => setActiveView('blog')}
            className={cn(
              "arrow-tile arrow-tile-last flex-1 py-6 px-8 transition-all duration-300",
              activeView === 'blog'
                ? "bg-secondary shadow-lg shadow-secondary/20"
                : "bg-[#212122] hover:bg-[#2a2a2b]"
            )}
          >
            <div className="flex items-center gap-4 pl-4">
              <span className={cn(
                "text-2xl font-bold",
                activeView === 'blog' ? "text-secondary-foreground" : "text-white/30"
              )}>
                3
              </span>
              <div className={cn(
                "p-2 rounded-full transition-colors",
                activeView === 'blog' ? "bg-secondary-foreground/10" : "bg-white/10"
              )}>
                <FileText className={cn(
                  "h-5 w-5",
                  activeView === 'blog' ? "text-secondary-foreground" : "text-white"
                )} />
              </div>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-semibold text-sm",
                  activeView === 'blog' ? "text-secondary-foreground" : "text-white"
                )}>
                  Blog Generatie
                </span>
                <span className={cn(
                  "text-xs",
                  activeView === 'blog' ? "text-secondary-foreground/70" : "text-white/50"
                )}>
                  Automatische blogs
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Form content area - beide forms altijd gemount om flikkering te voorkomen */}
        <div className="w-full max-w-2xl mx-auto min-h-[400px]">
          {activeView === 'none' && (
            <div className="text-white/40 text-center py-8">
              <p>Selecteer hierboven een optie om te beginnen</p>
            </div>
          )}
          
          <div className={cn(
            "seo-card p-8 md:p-10 transition-opacity duration-200",
            activeView === 'keyword' ? "opacity-100" : "hidden"
          )}>
            <KeywordResearchForm
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              isAdmin={isAdmin}
              user={user}
              saveNotification={saveNotification}
            />
          </div>
          
          <div className={cn(
            "seo-card p-8 md:p-10 transition-opacity duration-200",
            activeView === 'blog' ? "opacity-100" : "hidden"
          )}>
            <BlogGenerationForm
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              isAdmin={isAdmin}
              user={user}
              saveNotification={saveNotification}
              pageUrlSettings={pageUrlSettings}
            />
          </div>
          
          <div className={cn(
            "seo-card p-8 md:p-10 transition-opacity duration-200",
            activeView === 'pageurl' ? "opacity-100" : "hidden"
          )}>
            <PageUrlForm
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              isAdmin={isAdmin}
              user={user}
              saveNotification={saveNotification}
              pageUrlSettings={pageUrlSettings}
              pageUrlLoading={pageUrlLoading}
              pageUrlSaving={pageUrlSaving}
              savePageUrlSettings={savePageUrlSettings}
              reloadPageUrlSettings={reloadPageUrlSettings}
            />
          </div>
        </div>
      </div>

      {/* Overlay when panel is open */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      {/* Guide Sheet */}
      <Sheet open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white text-xl">SEO blog handleiding</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-8 text-white/80 pb-8">
            {/* Intro */}
            <p className="text-sm text-white/60">
              Volg dit stappenplan om een nieuwe klant volledig in te richten voor automatische bloggeneratie in het Mediabirds Dashboard.
            </p>

            {/* ID's Uitleg Sectie */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Belangrijk: ID's ophalen uit URL</h3>
              </div>
              
              <p className="text-sm text-white/60">
                Voor de configuratie heb je verschillende ID's nodig die je rechtstreeks uit de adresbalk van je browser kopieert.
              </p>

              {/* Spreadsheet ID & Grid ID */}
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">Spreadsheet ID & Grid ID</span>
                </div>
                <p className="text-xs text-white/60">Voorbeeld URL:</p>
                <code className="block px-3 py-2 rounded bg-white/5 text-xs text-white/70 break-all">
                  https://docs.google.com/spreadsheets/d/<span className="text-purple-300 font-medium">1u8Bm5XsTkAQBK4DYFgHjDMQMKLhbyeDVaG6JXcotLKk</span>/edit?gid=<span className="text-green-300 font-medium">0</span>#gid=0
                </code>
                <div className="space-y-1 text-xs text-white/60">
                  <p><span className="text-purple-300">Spreadsheet ID</span>: De lange reeks tussen <code className="px-1 bg-white/10 rounded">/d/</code> en <code className="px-1 bg-white/10 rounded">/edit</code></p>
                  <p><span className="text-green-300">Grid ID (gid)</span>: Het getal achter <code className="px-1 bg-white/10 rounded">gid=</code> (uniek per tabblad)</p>
                </div>
              </div>

              {/* Folder ID */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Folder ID</span>
                </div>
                <p className="text-xs text-white/60">Voorbeeld URL:</p>
                <code className="block px-3 py-2 rounded bg-white/5 text-xs text-white/70 break-all">
                  https://drive.google.com/drive/folders/<span className="text-blue-300 font-medium">19aZDo1aPwXHcIIYDIYN10ubPEa62ikkJ</span>
                </code>
                <p className="text-xs text-white/60">
                  <span className="text-blue-300">Folder ID</span>: De reeks letters en cijfers na <code className="px-1 bg-white/10 rounded">/folders/</code>
                </p>
              </div>
            </div>

            {/* Deel 1: Google Drive Inrichten */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 1: Google Drive Inrichten</h3>
              </div>
              <p className="text-sm text-white/60 -mt-2">Doel: De database en documentstructuur voor de klant klaarzetten.</p>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-300">1</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-blue-300">Toegang regelen</p>
                    <p>Vraag toegang tot de centrale map <a href="https://drive.google.com/drive/folders/1u8PyUe6-ZntBG_EhuU_nnkv4YpoWjEst?hl=nl" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">"SEO"</a> in Google Drive (beheerd door Tikt).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deel 2: Mediabirds Dashboard - Pagina URL's */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Settings2 className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 2: Pagina URL's</h3>
              </div>
              <p className="text-sm text-white/60 -mt-2">Doel: De sitemap koppelen voor interne linkbuilding.</p>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-300">2</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-green-300">Sitemaps toevoegen</p>
                    <p>Ga naar de website van de klant en surf naar [domeinnaam]/sitemap.xml. Identificeer de relevante sitemaps (bijv. de page-sitemap of post-sitemap).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-300">3</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-green-300">URL's documenteren</p>
                    <p>Kopieer de relevante URL's en plak deze in het dashboard onder Pagina URLs. Gebruik de knop "URL toevoegen" voor extra velden. Druk tot slot op de knop URL's documenteren.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deel 3: Zoekwoord Onderzoek */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Search className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 3: Zoekwoord Onderzoek</h3>
              </div>
              <p className="text-sm text-white/60 -mt-2">Doel: De AI voeden met de juiste zoekwoorddata.</p>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-300">4</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-orange-300">Bedrijfskennis invullen</p>
                    <p>Vul de gevraagde velden in op basis van de briefing of jouw kennis van het bedrijf.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-300">5</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-orange-300">Admin Instellingen configureren</p>
                    <p>Open het bestand [BEDRIJFSNAAM] seo in Google Drive, navigeer naar het tweede tab "Zoekwoord nieuw"</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li><span className="text-orange-300">Zoekwoord nieuw:</span> Haal de Grid ID op uit de browser URL en vul in.</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-300">6</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-orange-300">Testen</p>
                    <p>Klik op de knop om de koppeling te testen.</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li>Werkt het? Ga door naar stap 7.</li>
                      <li>Foutmelding? Neem contact op met Luc de Graag.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Deel 4: Blog Generatie */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <PenTool className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 4: Blog Generatie</h3>
              </div>
              <p className="text-sm text-white/60 -mt-2">Doel: De daadwerkelijke creatie en publicatie van content instellen.</p>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">7</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-pink-300">Basisinstellingen</p>
                    <p>Vul de velden in tot en met de sectie "Taal".</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">8</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-pink-300">Beeldmateriaal kiezen</p>
                    <p>Maak een keuze tussen AI-gegenereerde afbeeldingen of eigen foto's:</p>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 rounded bg-pink-500/10 border border-pink-500/30">
                        <p className="text-xs font-medium text-pink-300">Optie A: AI Afbeeldingen</p>
                        <p className="text-xs text-white/60 mt-1">Vul de hex-kleurcodes in die passen bij de huisstijl.</p>
                      </div>
                      <div className="p-2 rounded bg-pink-500/10 border border-pink-500/30">
                        <p className="text-xs font-medium text-pink-300">Optie B: Eigen foto's</p>
                        <ul className="text-xs text-white/60 mt-1 ml-3 space-y-1 list-disc">
                          <li>Maak in de bedrijfsmap twee mappen aan: Foto's [bedrijfsnaam] en Gebruikte foto's [bedrijfsnaam].</li>
                          <li>Kopieer de Folder ID's uit de URL-balk van je browser.</li>
                          <li>Plak deze ID's in de juiste velden in het dashboard.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">9</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-pink-300">Publicatie status</p>
                    <p>Kies tussen Draft (concept) of Publish (direct live).</p>
                    <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-300">Advies: Begin altijd met 'Draft' om de kwaliteit van de eerste blogs te controleren.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">10</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-pink-300">Categorieën (Optioneel)</p>
                    <p>Indien de klant specifieke WordPress-categorieën gebruikt, vul deze dan in het betreffende veld in.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">11</span>
                  <div className="text-sm text-white/70">
                    <p className="font-medium text-pink-300">Finalisering</p>
                    <p>Druk nog niet op de knop "Start", vraag eerst aan Luc of de koppeling met de bedrijfswebsite is gelegd.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Succes Banner */}
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium text-sm">Klaar! De automatische blogflow is nu ingesteld.</p>
                <p className="text-green-300/70 text-xs mt-1">Vergeet niet een laatste check te doen op de eerste gegenereerde concepten.</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SeoBlog;

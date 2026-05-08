import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, X, Search, FileText, Link as LinkIcon, BookOpen, Lightbulb, FolderOpen, Settings2, PenTool, CheckCircle2, Link2, Pencil, Save } from 'lucide-react';
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

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: 'success' | 'error';
}

type ActiveView = 'none' | 'keyword' | 'blog' | 'pageurl';

const SeoBlog = () => {
  const { isLoading: authLoading, user, isAdmin, isSuperAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('none');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<string | null>(
    localStorage.getItem('notifications_last_read')
  );
  
  // Editable guide title state
  const [guideTitle, setGuideTitle] = useState('SEO blog handleiding');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);

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

  // Load guide title from database
  useEffect(() => {
    const loadGuideTitle = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'seo_guide_title')
        .maybeSingle();
      
      if (data?.value) {
        setGuideTitle(data.value);
      }
    };
    loadGuideTitle();
  }, []);

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) return;
    
    setIsSavingTitle(true);
    const { error } = await supabase
      .from('app_settings')
      .update({ value: editedTitle.trim(), updated_at: new Date().toISOString() })
      .eq('key', 'seo_guide_title');
    
    if (!error) {
      setGuideTitle(editedTitle.trim());
      setIsEditingTitle(false);
    }
    setIsSavingTitle(false);
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
      
      <div className="w-full flex flex-col items-center justify-start pt-24 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          SEO
        </h1>
        <p className="text-white/50 text-lg mb-12 text-center max-w-lg">
          Beheer je zoekwoord onderzoek en blog generatie op één plek
        </p>
        
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
            <SheetTitle className="text-white text-xl flex items-center gap-2 group">
              {isEditingTitle ? (
                <>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-white/40 flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                  />
                  <button
                    onClick={handleSaveTitle}
                    disabled={isSavingTitle}
                    className="p-1 rounded hover:bg-white/10 text-green-400"
                    title="Opslaan"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  {guideTitle}
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        setEditedTitle(guideTitle);
                        setIsEditingTitle(true);
                      }}
                      className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Bewerken"
                    >
                      <Pencil className="h-4 w-4 text-white/60" />
                    </button>
                  )}
                </>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-8 text-white/80 pb-8">
            {/* Intro */}
            <p className="text-sm text-white/60">
              Volg deze stappen om het SEO-dashboard voor een nieuw bedrijf te configureren. Na configuratie voert het systeem automatisch zoekwoordonderzoek uit en worden er SEO-geoptimaliseerde blogs gegenereerd.
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

            {/* Deel 1: Google Drive */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 1: Google Drive Voorbereiding</h3>
              </div>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-300">1</span>
                  <p className="text-sm text-white/70">Zorg voor toegang tot de map <span className="text-blue-300">"SEO"</span> (beheerd door Tikt).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-300">2</span>
                  <div className="text-sm text-white/70">
                    <p>Open het bestand <span className="text-blue-300">SEO pagina URL's</span>:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li>Voeg een nieuw tabblad toe met de bedrijfsnaam</li>
                      <li>Kopieer de kolomstructuur van een bestaande sheet</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-300">3</span>
                  <div className="text-sm text-white/70">
                    <p>Kopieer <span className="text-blue-300">TEMPLATE: [BEDRIJFSNAAM] seo</span>:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li>Hernoem naar [Bedrijfsnaam] SEO</li>
                      <li>Maak map [Bedrijfsnaam] aan en verplaats sheet</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Deel 2: Dashboard Config */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Settings2 className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 2: Dashboard Basisconfiguratie</h3>
              </div>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-300">1</span>
                  <p className="text-sm text-white/70">Ga naar <span className="text-green-300">SEO</span> en voeg rechtsboven een nieuw bedrijf toe.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-300">2</span>
                  <div className="text-sm text-white/70">
                    <p>Ga naar <span className="text-green-300">Pagina URL</span> instellingen:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li>Vul de Spreadsheet ID en Grid ID in</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-300">3</span>
                  <div className="text-sm text-white/70">
                    <p>Sitemap indexeren:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li>Ga naar [domeinnaam.nl]/sitemap.xml</li>
                      <li>Selecteer relevante URL's en voeg toe</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Deel 3: Zoekwoordonderzoek */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Search className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 3: Zoekwoordonderzoek</h3>
              </div>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-300">1</span>
                  <div className="text-sm text-white/70">
                    <p>Open <span className="text-orange-300">Admin instellingen</span> en koppel ID's:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li><span className="text-orange-300">Hoofdzoekwoorden</span>: ID's van eerste sheet</li>
                      <li><span className="text-orange-300">Nieuwe zoekwoorden</span>: ID's van tweede sheet</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-300">2</span>
                  <p className="text-sm text-white/70">Klik op de testknop. Werkt het niet? Neem contact op met Luc de Graag.</p>
                </div>
              </div>
            </div>

            {/* Deel 4: Blog Generatie */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <PenTool className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deel 4: Blog Generatie & Publicatie</h3>
              </div>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">1</span>
                  <div className="text-sm text-white/70">
                    <p><span className="text-pink-300">Beeldmateriaal</span> configureren:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li><span className="text-pink-300">AI-afbeeldingen</span>: Voer hex-kleurcodes huisstijl in</li>
                      <li><span className="text-pink-300">Eigen foto's</span>: Maak mappen "Foto's [Bedrijfsnaam]" en "Gebruikte foto's [Bedrijfsnaam]" aan, koppel Folder ID's</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">2</span>
                  <div className="text-sm text-white/70">
                    <p><span className="text-pink-300">Publicatie & API</span>:</p>
                    <ul className="mt-1 ml-4 space-y-1 text-white/60 list-disc">
                      <li>Kies Draft (concept) of Direct Publiceren</li>
                      <li>WordPress API-URL's invullen:</li>
                    </ul>
                    <div className="mt-2 space-y-1">
                      <code className="block px-2 py-1 rounded bg-white/5 text-xs text-white/60">
                        Media: https://[domeinnaam]/wp-json/wp/v2/media
                      </code>
                      <code className="block px-2 py-1 rounded bg-white/5 text-xs text-white/60">
                        Posts: https://[domeinnaam]/wp-json/wp/v2/posts
                      </code>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-medium text-pink-300">3</span>
                  <p className="text-sm text-white/70">Activeer <span className="text-pink-300">Automatische trigger</span> en stel frequentie in (advies: 4-8 blogs/maand).</p>
                </div>
              </div>
            </div>

            {/* Succes Banner */}
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
              <p className="text-green-300 font-medium text-sm">Klaar! Het systeem is nu volledig geconfigureerd voor automatische SEO-content.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SeoBlog;

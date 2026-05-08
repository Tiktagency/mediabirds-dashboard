import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, X, Search, FileText, Link as LinkIcon } from 'lucide-react';
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
  const { isLoading: authLoading, user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('none');
  const [lastReadTime, setLastReadTime] = useState<string | null>(
    localStorage.getItem('notifications_last_read')
  );

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
    </div>
  );
};

export default SeoBlog;

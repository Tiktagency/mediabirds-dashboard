import { useState, useEffect } from 'react';
import { DashboardButton } from '@/components/dashboard/DashboardButton';
import { SavedHoursTile } from '@/components/dashboard/SavedHoursTile';
import NewsTicker from '@/components/NewsTicker';
import { CalendarDays, Search, FileText, BarChart3, Settings, Users, LogOut, Image, MessageCircle, User, Sparkles, Mail, LucideIcon, Crown, Shield, Play, Eye, Newspaper } from 'lucide-react';
import bannerImage from '@/assets/mountain-banner.png';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useN8nExecutionsBatch } from '@/hooks/useN8nExecutions';
import { useAutomationStatus } from '@/hooks/useAutomationStatus';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfileModal } from '@/components/ProfileModal';
import { CompleteProfileModal } from '@/components/CompleteProfileModal';
import { LoginLogsPanel } from '@/components/dashboard/LoginLogsPanel';
import { useNavigate } from 'react-router-dom';
import { ImpactLevel } from '@/components/dashboard/AutomationInfoTooltip';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Module-level guard tegen dubbele login logs
let sessionLogPending = false;

// Tile configuration mapping automation_name to route, icon, and variant
interface TileConfig {
  to: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'accent' | 'muted';
  n8nWorkflow?: string;
  statusKey?: string;
}

const tileConfigMap: Record<string, TileConfig> = {
  'saved-hours': {
    to: '',
    icon: CalendarDays, // Not used for saved-hours
    variant: 'primary',
  },
  'monday-planning': {
    to: '/monday-planning',
    icon: CalendarDays,
    variant: 'primary',
    n8nWorkflow: 'MEDIABIRDS monday planning',
  },
  'seo-blog': {
    to: '/seo-blog',
    icon: FileText,
    variant: 'accent',
    statusKey: 'seo-blog',
  },
  'wordpress-alt-text': {
    to: '/wordpress-alt-text',
    icon: Image,
    variant: 'primary',
    n8nWorkflow: 'MEDIABIRDS Alt-text Wordpress',
  },
  'chatbot': {
    to: '/chatbot',
    icon: MessageCircle,
    variant: 'secondary',
    n8nWorkflow: 'MEDIABIRDS klantenservice chatbot',
  },
  'copyright-branding': {
    to: '/copyright-branding',
    icon: Sparkles,
    variant: 'accent',
    statusKey: 'copyright-branding',
  },
  'email-handtekening': {
    to: '/email-signature',
    icon: Mail,
    variant: 'secondary',
    statusKey: 'email-handtekening',
  },
  'landingspagina': {
    to: '/landingspagina',
    icon: FileText,
    variant: 'primary',
    statusKey: 'landingspagina',
  },
  'leads-generator': {
    to: '/leads-generator',
    icon: Users,
    variant: 'secondary',
    statusKey: 'leads-generator',
  },
  'nieuwsbrief': {
    to: '/nieuwsbrief',
    icon: Newspaper,
    variant: 'accent',
    statusKey: 'nieuwsbrief',
  },
};

const Index = () => {
  const { isLoading, signOut, user, isAdmin, isSuperAdmin, roles } = useAuth();
  const { lastRuns: n8nLastRuns } = useN8nExecutionsBatch([
    'MEDIABIRDS klantenservice chatbot',
    'MEDIABIRDS monday planning',
    'MEDIABIRDS Alt-text Wordpress',
  ]);
  const { lastRuns } = useAutomationStatus();
  const { settings: dashboardSettings, isLoading: settingsLoading } = useDashboardSettings(user?.id);
  const { settings: automationSettings, isLoading: automationsLoading } = useAutomationSettings();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  // Check if profile is complete
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data?.first_name || !data?.last_name) {
            setShowCompleteProfile(true);
          }
        });
    }
  }, [user]);

  // Log new session visits (not refreshes) using sessionStorage
  useEffect(() => {
    if (!user || isLoading) return;

    const alreadyLogged = sessionStorage.getItem('session_logged');
    if (alreadyLogged || sessionLogPending) return;

    // Zet BEIDE flags direct
    sessionLogPending = true;

    // Zet flag DIRECT om race condition te voorkomen
    sessionStorage.setItem('session_logged', 'true');

    const logVisit = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const displayName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user.email;

      await supabase.rpc('log_user_visit', {
        p_user_id: user.id,
        p_email: user.email || '',
        p_display_name: displayName || '',
      });

    };

    logVisit();
  }, [user, isLoading]);


  // Apply theme from settings
  useEffect(() => {
    if (dashboardSettings?.theme) {
      setTheme(dashboardSettings.theme);
    }
  }, [dashboardSettings?.theme, setTheme]);

  // Get last run for a tile based on its config
  const getLastRun = (automationName: string): string | null => {
    const config = tileConfigMap[automationName];
    if (!config) return null;
    
      if (config.n8nWorkflow) {
      let n8nResult: string | null = null;
      if (config.n8nWorkflow === 'MEDIABIRDS klantenservice chatbot') n8nResult = n8nLastRuns['MEDIABIRDS klantenservice chatbot'] ?? null;
      if (config.n8nWorkflow === 'MEDIABIRDS monday planning') n8nResult = n8nLastRuns['MEDIABIRDS monday planning'] ?? null;
      if (config.n8nWorkflow === 'MEDIABIRDS Alt-text Wordpress') n8nResult = n8nLastRuns['MEDIABIRDS Alt-text Wordpress'] ?? null;
      
      // Als n8n resultaat beschikbaar is, gebruik dat
      if (n8nResult) return n8nResult;
      
      // Fallback naar automation_status tabel
      return lastRuns[automationName] || null;
    }
    
    if (config.statusKey) {
      return lastRuns[config.statusKey] || null;
    }
    
    return null;
  };

  // Get multiple last runs for tiles with sub-automations
  const getMultipleLastRuns = (automationName: string) => {
    if (automationName === 'seo-blog') {
      return [
        { label: 'SEO Onderzoek', time: lastRuns['seo-research'] || null },
        { label: 'Blog Generatie', time: lastRuns['blogs'] || null },
      ];
    }
    return undefined;
  };

  // Get automation setting by name
  const getAutomationSetting = (automationName: string) => {
    return automationSettings.find(s => s.automation_name === automationName);
  };

  // Get role badge config
  const getRoleBadge = () => {
    if (roles.includes('super_admin')) {
      return { label: 'Super Admin', icon: Crown, className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    }
    if (roles.includes('admin')) {
      return { label: 'Admin', icon: Shield, className: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    if (roles.includes('operator')) {
      return { label: 'Operator', icon: Play, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    if (roles.includes('viewer')) {
      return { label: 'Viewer', icon: Eye, className: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    return null;
  };

  const roleBadge = getRoleBadge();

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient">
        <div className="w-full h-48 2xl:h-64 bg-muted animate-pulse" />
        <div className="max-w-5xl 2xl:max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl 2xl:max-w-6xl mx-auto">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid size constant - same as TileOrganizer
  const GRID_SIZE = 10;
  
  // Get ordered items from dashboard settings (keep all 9 positions including empty slots)
  const getOrderedItems = () => {
    const allTileKeys = Object.keys(tileConfigMap);
    let items: string[] = [];

    if (dashboardSettings.tile_order?.length) {
      items = [...dashboardSettings.tile_order];
    } else {
      items = ['saved-hours', ...allTileKeys.filter(k => k !== 'saved-hours')];
    }

    // Auto-detect missing tiles from tileConfigMap
    const missingTiles = allTileKeys.filter(key => !items.includes(key));
    for (const tile of missingTiles) {
      const emptyIndex = items.findIndex(i => i.startsWith('__empty_'));
      if (emptyIndex !== -1) {
        items[emptyIndex] = tile;
      } else {
        items.push(tile);
      }
    }

    while (items.length < GRID_SIZE) {
      items.push(`__empty_${items.length}`);
    }
    return items.slice(0, GRID_SIZE);
  };
  
  const orderedItems = getOrderedItems();

  // Impact colors from dashboard settings
  const impactColors = dashboardSettings.impact_colors || {
    high: '#ef4444',
    medium: '#eab308',
    low: '#6b7280',
  };

  // Tile colors from dashboard settings
  const tileColors = dashboardSettings.tile_colors || {
    background: '#cfddd0',
    text: '#002C1F',
  };

  // Saved hours colors from dashboard settings
  const savedHoursColors = dashboardSettings.saved_hours_colors || {
    background: '#f2eadc',
    text: '#412700',
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Banner Section */}
      <header className="w-full h-48 2xl:h-64 overflow-hidden relative">
        <img 
          src={bannerImage} 
          alt="Mediabirds Banner" 
          className="w-full h-full object-cover"
          draggable="false"
        />
        <h1 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl md:text-6xl"
          style={{ fontFamily: "'Denton', serif", fontStyle: 'italic' }}
        >
          Mediabirds
        </h1>
        {isSuperAdmin && <LoginLogsPanel />}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {roleBadge && (
              <Badge variant="outline" className={roleBadge.className}>
                <roleBadge.icon className="w-3 h-3" />
                <span className="ml-1">{roleBadge.label}</span>
              </Badge>
            )}
            <span className="text-sm" style={{ color: '#232323' }}>{user?.email}</span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: '#232323' }}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Weet je zeker dat je wilt uitloggen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Je wordt uitgelogd en moet opnieuw inloggen om toegang te krijgen tot het dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction onClick={signOut}>Uitloggen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: '#232323' }}
              >
                <Settings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {isAdmin && (
                <DropdownMenuItem 
                  onClick={() => navigate('/admin')}
                  className="cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin panel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Mijn profiel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="max-w-5xl 2xl:max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl 2xl:max-w-6xl mx-auto">
          {orderedItems.map((item, index) => {
            const isEmpty = !item || item.startsWith('__empty_') || !tileConfigMap[item];
            
            // Render placeholder for empty slots
            if (isEmpty) {
              return (
                <DashboardButton 
                  key={`empty-${index}`}
                  label="" 
                  variant="muted"
                  icon={BarChart3}
                  disabled 
                />
              );
            }
            
            // Render SavedHoursTile for saved-hours
            if (item === 'saved-hours') {
              return (
                <SavedHoursTile 
                  key={item} 
                  tileColors={savedHoursColors}
                />
              );
            }
            
            // Render actual tile
            const config = tileConfigMap[item];
            const automationSetting = getAutomationSetting(item);
            const customLabel = dashboardSettings.custom_labels?.[item];
            
            // Get label: custom_label > display_name > automation_name
            const label = customLabel || automationSetting?.display_name || item;
            
            // Get description and impact from automation settings
            const description = automationSetting?.description || '';
            const impact = (automationSetting?.impact_level || 'medium') as ImpactLevel;
            
            return (
              <DashboardButton 
                key={item}
                to={config.to}
                label={label}
                variant={config.variant}
                icon={config.icon}
                description={description}
                impact={impact}
                lastRun={getLastRun(item)}
                multipleLastRuns={getMultipleLastRuns(item)}
                impactColors={impactColors}
                status={automationSetting?.status}
                tileColors={tileColors}
              />
            );
          })}
        </div>
      </div>
      <NewsTicker />
      
      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
        user={user} 
      />

      {user && (
        <CompleteProfileModal
          open={showCompleteProfile}
          userId={user.id}
          onCompleted={() => setShowCompleteProfile(false)}
        />
      )}
    </div>
  );
};

export default Index;

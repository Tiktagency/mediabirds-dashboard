import { useState, useEffect } from 'react';
import { DashboardButton } from '@/components/dashboard/DashboardButton';
import NewsTicker from '@/components/NewsTicker';
import { CalendarDays, Search, FileText, BarChart3, Settings, Users, LogOut, Image, MessageCircle, User, LucideIcon } from 'lucide-react';
import bannerImage from '@/assets/mountain-banner.png';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useN8nExecutions } from '@/hooks/useN8nExecutions';
import { useAutomationStatus } from '@/hooks/useAutomationStatus';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfileModal } from '@/components/ProfileModal';
import { useNavigate } from 'react-router-dom';
import { ImpactLevel } from '@/components/dashboard/AutomationInfoTooltip';
import { useTheme } from 'next-themes';

// Tile configuration mapping automation_name to route, icon, and variant
interface TileConfig {
  to: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'accent' | 'muted';
  n8nWorkflow?: string;
  statusKey?: string;
}

const tileConfigMap: Record<string, TileConfig> = {
  'monday-planning': {
    to: '/monday-planning',
    icon: CalendarDays,
    variant: 'primary',
    n8nWorkflow: 'MEDIABIRDS monday planning',
  },
  'zoekwoord-onderzoek': {
    to: '/zoekwoord-onderzoek',
    icon: Search,
    variant: 'secondary',
    statusKey: 'seo-research',
  },
  'blogs': {
    to: '/blogs',
    icon: FileText,
    variant: 'accent',
    statusKey: 'blogs',
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
};

const Index = () => {
  const { isLoading, signOut, user } = useAdminAuth();
  const { lastRun: chatbotLastRun } = useN8nExecutions('MEDIABIRDS klantenservice chatbot');
  const { lastRun: mondayLastRun } = useN8nExecutions('MEDIABIRDS monday planning');
  const { lastRun: altTextLastRun } = useN8nExecutions('MEDIABIRDS Alt-text Wordpress');
  const { lastRuns } = useAutomationStatus();
  const { settings: dashboardSettings, isLoading: settingsLoading } = useDashboardSettings();
  const { settings: automationSettings, isLoading: automationsLoading } = useAutomationSettings();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

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
      if (config.n8nWorkflow === 'MEDIABIRDS klantenservice chatbot') return chatbotLastRun;
      if (config.n8nWorkflow === 'MEDIABIRDS monday planning') return mondayLastRun;
      if (config.n8nWorkflow === 'MEDIABIRDS Alt-text Wordpress') return altTextLastRun;
    }
    
    if (config.statusKey) {
      return lastRuns[config.statusKey] || null;
    }
    
    return null;
  };

  // Get automation setting by name
  const getAutomationSetting = (automationName: string) => {
    return automationSettings.find(s => s.automation_name === automationName);
  };

  if (isLoading || settingsLoading || automationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // Get ordered tiles from dashboard settings (filter out empty slots and invalid names)
  const orderedTiles = dashboardSettings.tile_order?.length 
    ? dashboardSettings.tile_order
        .filter(name => name && !name.startsWith('__empty_') && tileConfigMap[name])
    : Object.keys(tileConfigMap);

  // Impact colors from dashboard settings
  const impactColors = dashboardSettings.impact_colors || {
    high: '#ef4444',
    medium: '#eab308',
    low: '#6b7280',
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Banner Section */}
      <header className="w-full h-48 overflow-hidden relative">
        <img 
          src={bannerImage} 
          alt="Mediabirds Banner" 
          className="w-full h-full object-cover"
        />
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl md:text-6xl font-bold">
          Mediabirds
        </h1>
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <span className="text-sm" style={{ color: '#232323' }}>{user?.email}</span>

          <Button 
            onClick={signOut}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            style={{ color: '#232323' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Uitloggen
          </Button>
          
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
              <DropdownMenuItem 
                onClick={() => navigate('/admin')}
                className="cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin panel
              </DropdownMenuItem>
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

      <div className="max-w-5xl mx-auto px-6 py-16">
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {orderedTiles.map((automationName) => {
            const config = tileConfigMap[automationName];
            const automationSetting = getAutomationSetting(automationName);
            const customLabel = dashboardSettings.custom_labels?.[automationName];
            
            // Get label: custom_label > display_name > automation_name
            const label = customLabel || automationSetting?.display_name || automationName;
            
            // Get description and impact from automation settings
            const description = automationSetting?.description || '';
            const impact = (automationSetting?.impact_level || 'medium') as ImpactLevel;
            
            return (
              <DashboardButton 
                key={automationName}
                to={config.to}
                label={label}
                variant={config.variant}
                icon={config.icon}
                description={description}
                impact={impact}
                lastRun={getLastRun(automationName)}
                impactColors={impactColors}
                status={automationSetting?.status}
              />
            );
          })}
          
          {/* Placeholder tiles */}
          <DashboardButton 
            label="" 
            variant="muted"
            icon={BarChart3}
            disabled 
          />
          <DashboardButton 
            label="" 
            variant="muted"
            icon={Settings}
            disabled 
          />
          <DashboardButton 
            label="" 
            variant="muted"
            icon={Users}
            disabled 
          />
        </div>
      </div>
      <NewsTicker />
      
      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
        user={user} 
      />
    </div>
  );
};

export default Index;

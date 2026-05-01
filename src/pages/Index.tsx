import { useState, useEffect, useMemo } from 'react';
import { DashboardButton } from '@/components/dashboard/DashboardButton';
import { SavedHoursTile } from '@/components/dashboard/SavedHoursTile';
import NewsTicker from '@/components/NewsTicker';
import { CalendarDays, Search, FileText, BarChart3, Settings, Users, LogOut, Image, MessageCircle, User, LucideIcon } from 'lucide-react';
import bannerImage from '@/assets/mountain-banner.png';
import { useAuth } from '@/hooks/useAuth';
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
import { Badge } from '@/components/ui/badge';

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
  const { isLoading, signOut, user, isAdmin, roles } = useAuth();
  const { lastRun: chatbotLastRun } = useN8nExecutions('MEDIABIRDS klantenservice chatbot');
  const { lastRun: mondayLastRun } = useN8nExecutions('MEDIABIRDS monday planning');
  const { lastRun: altTextLastRun } = useN8nExecutions('MEDIABIRDS Alt-text Wordpress');
  const { lastRuns } = useAutomationStatus();
  const { settings: dashboardSettings, isLoading: settingsLoading } = useDashboardSettings();
  const { settings: automationSettings, isLoading: automationsLoading } = useAutomationSettings();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  // Get all connected n8n workflow names for saved hours calculation
  const connectedWorkflowNames = useMemo(() => {
    const names: string[] = [];
    Object.values(tileConfigMap).forEach(config => {
      if (config.n8nWorkflow) {
        names.push(config.n8nWorkflow);
      }
    });
    // Also add workflow names from automation settings
    automationSettings.forEach(setting => {
      if (setting.n8n_workflow_name && !names.includes(setting.n8n_workflow_name)) {
        names.push(setting.n8n_workflow_name);
      }
    });
    return names;
  }, [automationSettings]);

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

  // Get role badge config
  const getRoleBadge = () => {
    if (roles.includes('admin')) {
      return { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    if (roles.includes('operator')) {
      return { label: 'Operator', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    if (roles.includes('viewer')) {
      return { label: 'Viewer', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    return null;
  };

  const roleBadge = getRoleBadge();

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

  // Grid size constant - same as TileOrganizer
  const GRID_SIZE = 9;
  
  // Get ordered items from dashboard settings (keep all 9 positions including empty slots)
  const getOrderedItems = () => {
    if (dashboardSettings.tile_order?.length) {
      const items = [...dashboardSettings.tile_order];
      // Pad to ensure 9 items
      while (items.length < GRID_SIZE) {
        items.push(`__empty_${items.length}`);
      }
      return items.slice(0, GRID_SIZE);
    }
    // Default: all tiles + empty placeholders
    const defaultTiles = Object.keys(tileConfigMap);
    while (defaultTiles.length < GRID_SIZE) {
      defaultTiles.push(`__empty_${defaultTiles.length}`);
    }
    return defaultTiles;
  };
  
  const orderedItems = getOrderedItems();

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
          draggable="false"
        />
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl md:text-6xl font-bold">
          Mediabirds
        </h1>
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: '#232323' }}>{user?.email}</span>
            {roleBadge && (
              <Badge variant="outline" className={roleBadge.className}>
                {roleBadge.label}
              </Badge>
            )}
          </div>

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

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Saved Hours Tile - always first */}
          <SavedHoursTile workflowNames={connectedWorkflowNames} />
          
          {orderedItems.slice(0, 8).map((item, index) => {
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
                impactColors={impactColors}
                status={automationSetting?.status}
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
    </div>
  );
};

export default Index;

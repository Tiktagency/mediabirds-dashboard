import { DashboardButton } from '@/components/dashboard/DashboardButton';
import NewsTicker from '@/components/NewsTicker';
import { CalendarDays, Search, FileText, BarChart3, Settings, Users, LogOut, Image, MessageCircle } from 'lucide-react';
import bannerImage from '@/assets/mountain-banner.png';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { useAutomationStatus } from '@/hooks/useAutomationStatus';

const Index = () => {
  const { isLoading, signOut, user } = useAdminAuth();
  const { statuses } = useAutomationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

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
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <DashboardButton 
            to="/monday-planning" 
            label="Monday planning" 
            variant="primary"
            icon={CalendarDays}
            automationName="monday-planning"
            status={statuses['monday-planning']}
          />
          <DashboardButton 
            to="/zoekwoord-onderzoek" 
            label="Zoekwoord onderzoek"
            variant="secondary"
            icon={Search}
            automationName="seo"
            status={statuses['seo']}
          />
          <DashboardButton 
            to="/blogs" 
            label="Blogs" 
            variant="accent"
            icon={FileText}
            automationName="blogs"
            status={statuses['blogs']}
          />
          <DashboardButton 
            to="/wordpress-alt-text"
            label="Alt-tekst wordpress" 
            variant="primary"
            icon={Image}
            automationName="wordpress-alt-text"
            status={statuses['wordpress-alt-text']}
          />
          <DashboardButton 
            to="/chatbot"
            label="Chatbot" 
            variant="secondary"
            icon={MessageCircle}
          />
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
    </div>
  );
};

export default Index;
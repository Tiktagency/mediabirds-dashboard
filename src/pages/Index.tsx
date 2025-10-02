import { DashboardButton } from '@/components/dashboard/DashboardButton';
import NewsTicker from '@/components/NewsTicker';
import { CalendarDays, Search, FileText, Mail, BarChart3, Settings, Users } from 'lucide-react';
import bannerImage from '@/assets/mediabirds-banner.png';

const Index = () => {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Banner Section */}
      <header className="w-full overflow-hidden">
        <img 
          src={bannerImage} 
          alt="Mediabirds" 
          className="w-full h-auto object-cover"
        />
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <DashboardButton 
            to="/monday-planning" 
            label="Monday planning" 
            variant="primary"
            icon={CalendarDays}
          />
          <DashboardButton 
            to="/seo" 
            label="Zoekwoord onderzoek" 
            variant="secondary"
            icon={Search}
          />
          <DashboardButton 
            to="/blogs" 
            label="Blogs" 
            variant="accent"
            icon={FileText}
          />
          <DashboardButton 
            label="" 
            variant="muted"
            icon={Mail}
            disabled 
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
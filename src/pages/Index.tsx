import { DashboardButton } from '@/components/dashboard/DashboardButton';
import NewsTicker from '@/components/NewsTicker';

const Index = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          Mediabirds Dashboard
        </h1>
        
        <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
          <DashboardButton 
            to="/monday-planning" 
            label="Monday planning" 
            variant="primary" 
          />
          <DashboardButton 
            to="/seo" 
            label="Zoekwoord onderzoek" 
            variant="secondary" 
          />
          <DashboardButton 
            to="/blogs" 
            label="Blogs" 
            variant="accent" 
          />
          <DashboardButton 
            label="" 
            variant="muted" 
            disabled 
          />
        </div>
      </div>
      <NewsTicker />
    </div>
  );
};

export default Index;
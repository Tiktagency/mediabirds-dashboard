import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import ChatWidget from '@/components/ChatWidget';

const MondayPlanning = () => {
  return (
    <div className="min-h-screen relative">
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
      
      <HeroSection />
      <ChatWidget />
    </div>
  );
};

export default MondayPlanning;
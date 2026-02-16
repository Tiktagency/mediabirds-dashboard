import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          Mediabirds Dashboard
        </h1>
        
        <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Button 1 - Monday Planning */}
          <Link to="/monday-planning">
            <Button 
              className="w-full h-32 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Monday planning
            </Button>
          </Link>
          
          {/* Button 2 - SEO */}
          <a href="https://seo-interface.lovable.app/" target="_blank" rel="noopener noreferrer">
            <Button 
              className="w-full h-32 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              size="lg"
            >
              SEO
            </Button>
          </a>
          
          {/* Button 3 - Empty */}
          <Button 
            className="w-full h-32 text-lg font-semibold rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground"
            size="lg"
            disabled
          >
            
          </Button>
          
          {/* Button 4 - Empty */}
          <Button 
            className="w-full h-32 text-lg font-semibold rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground"
            size="lg"
            disabled
          >
            
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
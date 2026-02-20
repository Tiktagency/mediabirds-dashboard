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
          <Link to="/seo">
            <Button 
              className="w-full h-32 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              size="lg"
            >
              Zoekwoord onderzoek
            </Button>
          </Link>
          
          {/* Button 3 - Blogs */}
          <Link to="/blogs">
            <Button 
              className="w-full h-32 text-lg font-semibold rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              Blogs
            </Button>
          </Link>
          
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
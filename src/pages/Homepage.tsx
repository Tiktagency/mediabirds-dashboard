import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground">
          Hoofdmenu
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
          <Button 
            className="w-full h-32 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            size="lg"
          >
            SEO
          </Button>
          
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
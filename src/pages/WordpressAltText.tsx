import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import workflowImage from '@/assets/wordpress-alt-text-workflow.png';

const WordpressAltText = () => {
  const { isLoading } = useAdminAuth();

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
      
      <HeroSection title="Alt-tekst wordpress" />
      
      <div className="flex justify-center items-center py-12 px-6 bg-background">
        <img 
          src={workflowImage} 
          alt="WordPress Alt Text Workflow" 
          className="max-w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default WordpressAltText;

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SeoPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Back to home button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar home
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          SEO blogteskten
        </h1>
        
        <div className="flex justify-center">
          <Button 
            size="lg"
            className="px-8 py-4 text-lg font-semibold"
          >
            Start SEO proces
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeoPage;
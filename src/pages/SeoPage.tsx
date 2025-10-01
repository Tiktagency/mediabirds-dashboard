import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SeoPage = () => {
  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <div className="max-w-7xl w-full mx-auto px-6 py-6">
        <Link to="/">
          <Button variant="outline" className="mb-4">
            ← Terug naar Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex-1 w-full">
        <iframe
          src="https://seo-interface.lovable.app/"
          className="w-full h-full border-0"
          title="Zoekwoord onderzoek"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default SeoPage;
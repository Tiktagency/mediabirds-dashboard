import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SeoPage = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* Dashboard button */}
      <div className="absolute top-6 left-6 z-50">
        <Link to="/">
          <Button variant="outline">
            Terug naar Dashboard
          </Button>
        </Link>
      </div>
      
      {/* Fullscreen iframe */}
      <iframe
        src="https://seo-interface.lovable.app/"
        className="w-full h-full border-0"
        title="Zoekwoord onderzoek"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default SeoPage;
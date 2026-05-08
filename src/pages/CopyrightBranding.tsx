import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CopyrightBrandingForm } from '@/components/copyright-branding/CopyrightBrandingForm';

const CopyrightBranding = () => {
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="w-full flex flex-col items-center justify-start pt-8 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Copyright Branding
        </h1>
        <p className="text-white/50 text-lg mb-8 text-center max-w-lg">
          Herschrijf tekst in een nieuwe stijl en vanuit verschillende persoonlijkheidstypes
        </p>

        <CopyrightBrandingForm />
      </div>
    </div>
  );
};

export default CopyrightBranding;

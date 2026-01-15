import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CopyrightBrandingForm } from '@/components/copyright-branding/CopyrightBrandingForm';

const CopyrightBranding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Back Button */}
      <div className="w-full px-6 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
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

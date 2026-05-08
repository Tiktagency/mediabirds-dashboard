import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CopyrightBrandingForm } from '@/components/copyright-branding/CopyrightBrandingForm';
import bannerImage from '@/assets/mountain-banner.png';

const CopyrightBranding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Banner Section */}
      <header className="w-full h-48 overflow-hidden relative">
        <img 
          src={bannerImage} 
          alt="Mediabirds Banner" 
          className="w-full h-full object-cover"
          draggable="false"
        />
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </header>
      
      <div className="w-full flex flex-col items-center justify-start pt-24 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Copyright Branding
        </h1>
        <p className="text-white/50 text-lg mb-12 text-center max-w-lg">
          Herschrijf tekst in een nieuwe stijl en vanuit verschillende persoonlijkheidstypes
        </p>

        <CopyrightBrandingForm />
      </div>
    </div>
  );
};

export default CopyrightBranding;

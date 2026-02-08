import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dashboardMockup from '@/assets/tikt-dashboard-mockup.jpg';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero-gradient min-h-screen w-full flex items-center">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-12">
        <div className="flex items-center justify-center">
          {/* Text Content */}
          <div className="text-center">
            <h1 
              className={`hero-title text-white mb-6 ${isVisible ? 'fade-in-up delay-1' : ''}`}
            >
              Kennisbank Tikt
            </h1>
            
            <p 
              className={`hero-subtitle text-lg mb-8 ${isVisible ? 'fade-in-up delay-2' : ''}`}
            >
              Chat met de kennisbank van Tikt.ai
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
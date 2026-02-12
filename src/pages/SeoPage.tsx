import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2 } from 'lucide-react';

const SeoPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartClick = () => {
    setIsLoading(true);
    setProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsLoading(false);
            return 100;
          }
          return prev + 2; // Verhoog met 2% elke 100ms = 5 seconden totaal
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);
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

      {/* Main content centered in screen */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-center mb-16 text-white">
          SEO blogteskten
        </h1>
        
        <div className="flex flex-col items-center space-y-8">
          <Button 
            onClick={handleStartClick}
            disabled={isLoading}
            size="lg"
            className="px-12 py-6 text-xl font-semibold rounded-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Laden...
              </>
            ) : (
              'Start'
            )}
          </Button>

          {/* Progress bar */}
          {isLoading && (
            <div className="w-80 space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-white text-sm">
                {Math.round(progress)}% voltooid
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoPage;
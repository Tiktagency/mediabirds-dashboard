import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const SeoPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleStartClick = async () => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, 95)); // Stop at 95% until response
      }, 50);

      // Send POST request to webhook
      const response = await fetch('https://tikt.app.n8n.cloud/webhook/f1bb199e-ee0c-4cb1-b085-557ea22fa79f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'seo_text_generation',
          timestamp: new Date().toISOString()
        })
      });

      clearInterval(progressInterval);
      
      const responseData = await response.json();
      
      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Melding",
            description: responseData.Error || JSON.stringify(responseData),
            duration: 6000,
          });
        }, 500);
      } else {
        throw new Error('Webhook request failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Er is iets misgegaan bij het aanmaken van de SEO tekst",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
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
        <h1 className="text-4xl font-bold text-center mb-4 text-white">
          SEO blog teksten
        </h1>
        
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Klik op start om de SEO blog tekst automatisering te activeren
        </p>
        
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
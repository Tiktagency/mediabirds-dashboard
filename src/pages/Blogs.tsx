import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Blogs = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = async () => {
    setIsLoading(true);
    console.log("Triggering n8n webhook");

    try {
      const response = await fetch('https://tikt.app.n8n.cloud/webhook/f1bb199e-ee0c-4cb1-b085-557ea22fa79f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: 'blogs_page',
        }),
      });

      let message = 'Geen bericht beschikbaar';
      
      try {
        const text = await response.text();
        
        if (text) {
          try {
            const data = JSON.parse(text);
            // Extract all values from the response object
            const values = Object.values(data).filter(v => typeof v === 'string');
            message = values.join(' ') || JSON.stringify(data);
          } catch {
            // If not valid JSON, use the text directly
            message = text;
          }
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
      }
      
      if (response.ok) {
        toast({
          title: "Response ontvangen",
          description: message,
          duration: 10000,
        });
      } else {
        toast({
          title: "Fout",
          description: message,
          duration: 10000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Fout",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
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
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-5xl font-bold text-center mb-8 text-white">
          Blogs
        </h1>
        
        <p className="text-center text-white/90 text-lg mb-8">
          Druk op de start knop om blogs te genereren
        </p>
        
        <Button 
          size="lg" 
          className="px-12 py-6 text-lg h-auto"
          onClick={handleStartClick}
          disabled={isLoading}
        >
          {isLoading ? 'Bezig...' : 'Start'}
        </Button>
      </div>
    </div>
  );
};

export default Blogs;

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  status: 'success' | 'error';
}

const Blogs = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const addNotification = (message: string, status: 'success' | 'error') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      status,
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, 20); // Keep only the 20 most recent
    });
  };

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
        addNotification(message, 'success');
      } else {
        toast({
          title: "Fout",
          description: message,
          duration: 10000,
          variant: "destructive",
        });
        addNotification(message, 'error');
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      const errorMessage = "Er is iets misgegaan. Probeer het opnieuw.";
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      addNotification(errorMessage, 'error');
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

      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 relative"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
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

      {/* Notification Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background border-l shadow-lg transform transition-transform duration-300 z-50 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Meldingen</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Geen meldingen
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.status === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                  }`}
                >
                  <p className="text-sm mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(notification.timestamp, 'dd MMM yyyy HH:mm:ss', { locale: nl })}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay when panel is open */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default Blogs;

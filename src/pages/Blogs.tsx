import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  status: 'success' | 'error';
}

const Blogs = () => {
  const { toast, dismiss } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<string | null>(
    localStorage.getItem('notifications_last_read')
  );

  // Load notifications from database
  useEffect(() => {
    loadNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    if (data) {
      setNotifications(data as Notification[]);
    }
  };

  const addNotification = async (message: string, status: 'success' | 'error') => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        message,
        status,
      });

    if (error) {
      console.error('Error saving notification:', error);
    }
  };

  const unreadCount = notifications.filter(
    n => !lastReadTime || new Date(n.created_at) > new Date(lastReadTime)
  ).length;

  const handlePanelToggle = () => {
    if (!isPanelOpen) {
      // Opening panel - mark all as read
      const now = new Date().toISOString();
      setLastReadTime(now);
      localStorage.setItem('notifications_last_read', now);
      dismiss();
    }
    setIsPanelOpen(!isPanelOpen);
  };

  const handleStartClick = async () => {
    setIsLoading(true);
    console.log("Triggering n8n webhook");

    // Create AbortController with 180 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 seconds

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      
      let errorMessage = "Er is iets misgegaan. Probeer het opnieuw.";
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = "De aanvraag duurde te lang (meer dan 3 minuten). Probeer het opnieuw.";
      }
      
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
          onClick={handlePanelToggle}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
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
        
        {isLoading && (
          <p className="text-center text-white/80 text-sm mb-4">
            Dit kan enkele minuten duren, even geduld...
          </p>
        )}
        
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
                  <p className="text-sm mb-2 text-gray-900 dark:text-gray-100">{notification.message}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {format(new Date(notification.created_at), 'dd-MM-yyyy HH:mm', { locale: nl })}
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

import { useState, useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

interface LoginLog {
  id: string;
  display_name: string | null;
  email: string | null;
  logged_in_at: string;
}

export const LoginLogsPanel = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('login_logs')
      .select('id, display_name, email, logged_in_at')
      .gte('logged_in_at', sevenDaysAgo.toISOString())
      .order('logged_in_at', { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="absolute top-6 left-6 hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: '#232323' }}
          title="Login logs"
        >
          <ScrollText className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card border-border w-80 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-foreground">Login logs (7 dagen)</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Geen logins in de afgelopen 7 dagen.
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                <p className="text-sm font-medium text-foreground">
                  {log.display_name || 'Onbekend'}
                </p>
                <p className="text-xs text-muted-foreground">{log.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(log.logged_in_at), 'dd-MM-yyyy HH:mm', { locale: nl })}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

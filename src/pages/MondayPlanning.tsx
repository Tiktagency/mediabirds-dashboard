import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';


const MondayPlanning = () => {
  const { isLoading: authLoading, user } = useAdminAuth();
  const { toast } = useToast();
  
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [pakket, setPakket] = useState('');
  const [startDatum, setStartDatum] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = bedrijfsnaam.trim() !== '' && 
                      pakket !== '' && 
                      startDatum !== undefined;

  const saveNotification = async (message: string, status: 'success' | 'error') => {
    if (!user) return;
    
    await supabase.from('notifications').insert({
      message,
      status,
      user_id: user.id,
    });
  };

  const updateAutomationStatus = async (status: 'active' | 'running' | 'inactive') => {
    try {
      await supabase.functions.invoke('update-automation-status', {
        body: {
          automation_name: 'monday-planning',
          status,
          last_run: status === 'active' ? new Date().toISOString() : undefined
        }
      });
    } catch (error) {
      console.error('Error updating automation status:', error);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    await updateAutomationStatus('running');

    const messageContent = `Nodige gegeven:\n${bedrijfsnaam}, Pakket ${pakket}, ${format(startDatum!, 'dd-MM-yyyy', { locale: nl })}`;

    try {
      const { data: invokeData, error: invokeError } = await supabase.functions.invoke('trigger-monday-planning', {
        body: {
          message: messageContent,
          bedrijfsnaam,
          pakket,
          startDatum: format(startDatum!, 'yyyy-MM-dd'),
        },
      });

      const ok = !invokeError && (invokeData as { success?: boolean })?.success;
      const responseText = (invokeData as { text?: string })?.text ?? '';

      if (ok) {
        let responseMessage = 'Planning succesvol verzonden!';

        if (responseText) {
          try {
            const data = JSON.parse(responseText);
            if (data.message?.content) {
              responseMessage = typeof data.message.content === 'string'
                ? data.message.content
                : JSON.stringify(data.message.content);
            } else if (data.output) {
              responseMessage = data.output;
            }
          } catch {
            responseMessage = responseText || 'Planning succesvol verzonden!';
          }
        }

        toast({
          title: "Succes!",
          description: responseMessage,
          duration: 7000,
        });
        await saveNotification(responseMessage, 'success');
        await updateAutomationStatus('active');

        setBedrijfsnaam('');
        setPakket('');
        setStartDatum(undefined);
      } else {
        const errorMessage = responseText || invokeError?.message || 'Er is iets misgegaan bij het verzenden';
        toast({
          title: "Fout",
          description: errorMessage,
          variant: "destructive",
          duration: 7000,
        });
        await saveNotification(errorMessage, 'error');
        await updateAutomationStatus('inactive');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = 'Kon geen verbinding maken met de server';
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
      await saveNotification(errorMessage, 'error');
      await updateAutomationStatus('inactive');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] relative">
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

      <div className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Monday planning Mediabirds
        </h1>

        <div className="w-full max-w-xl xl:max-w-2xl bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="space-y-6">
            {/* Bedrijfsnaam */}
            <div className="space-y-2">
              <Label htmlFor="bedrijfsnaam" className="text-white">Bedrijfsnaam</Label>
              <Input
                id="bedrijfsnaam"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                placeholder="Voer bedrijfsnaam in"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Pakket */}
            <div className="space-y-2">
              <Label htmlFor="pakket" className="text-white">Pakket</Label>
              <Select value={pakket} onValueChange={setPakket}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecteer pakket" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="A" className="text-white hover:bg-white/10">Pakket A</SelectItem>
                  <SelectItem value="B" className="text-white hover:bg-white/10">Pakket B</SelectItem>
                  <SelectItem value="C" className="text-white hover:bg-white/10">Pakket C</SelectItem>
                  <SelectItem value="D" className="text-white hover:bg-white/10">Pakket D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start datum */}
            <div className="space-y-2">
              <Label className="text-white">Start datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                      !startDatum && "text-white/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDatum ? format(startDatum, "PPP", { locale: nl }) : "Selecteer datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={startDatum}
                    onSelect={setStartDatum}
                    initialFocus
                    className="pointer-events-auto bg-popover text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || isDemo}
              variant="primaryCustom"
              className="w-full mt-4"
              title={isDemo ? DEMO_TOOLTIP : undefined}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verzenden...
                </>
              ) : isDemo ? (
                'Start (demo - uitgeschakeld)'
              ) : (
                'Start'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MondayPlanning;

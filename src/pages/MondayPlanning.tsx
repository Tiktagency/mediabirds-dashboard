import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import bannerImage from '@/assets/mountain-banner.png';

const WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/31605fee-d222-4693-accb-69e6ca4cdffd';
const API_KEY = 'JGMhfDirhe73J5DvjeG6dJ8';

const FASES = [
  { id: 'webdesign', label: 'Webdesign' },
  { id: 'development', label: 'Development' },
  { id: 'testen-feedback', label: 'Testen & feedback' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'livegang', label: 'Livegang' },
];

const MondayPlanning = () => {
  const { isLoading: authLoading, user, signOut } = useAdminAuth();
  const { toast } = useToast();
  
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [pakket, setPakket] = useState('');
  const [startDatum, setStartDatum] = useState<Date>();
  const [selectedFases, setSelectedFases] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = bedrijfsnaam.trim() !== '' && 
                      pakket !== '' && 
                      startDatum !== undefined && 
                      selectedFases.length > 0;

  const handleFaseToggle = (faseId: string) => {
    setSelectedFases(prev => 
      prev.includes(faseId) 
        ? prev.filter(id => id !== faseId)
        : [...prev, faseId]
    );
  };

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

    const faseLabels = selectedFases.map(id => 
      FASES.find(f => f.id === id)?.label
    ).filter(Boolean);

    const messageContent = `Nodige gegeven:\n${bedrijfsnaam}, Pakket ${pakket}, ${format(startDatum!, 'dd-MM-yyyy', { locale: nl })}\n\nFases:\n${faseLabels.join(', ')}`;

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          message: messageContent,
          timestamp: new Date().toISOString(),
          sender: 'user',
          bedrijfsnaam,
          pakket,
          startDatum: format(startDatum!, 'yyyy-MM-dd'),
          fases: faseLabels,
        }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
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
        
        // Reset form
        setBedrijfsnaam('');
        setPakket('');
        setStartDatum(undefined);
        setSelectedFases([]);
      } else {
        const errorMessage = responseText || 'Er is iets misgegaan bij het verzenden';
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
    <div className="min-h-screen hero-gradient">
      {/* Banner Section */}
      <header className="w-full h-48 overflow-hidden relative">
        <img 
          src={bannerImage} 
          alt="Monday Planning Banner" 
          className="w-full h-full object-cover"
        />
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl md:text-5xl font-bold text-center">
          Monday Planning
        </h1>
        <div className="absolute top-6 left-6">
          <Link to="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 hover:bg-white/20"
              style={{ color: '#232323' }}
            >
              Dashboard
            </Button>
          </Link>
        </div>
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <span className="text-sm" style={{ color: '#232323' }}>{user?.email}</span>
          <Button 
            onClick={signOut}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            style={{ color: '#232323' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
          <div className="space-y-6">
            {/* Bedrijfsnaam */}
            <div className="space-y-2">
              <Label htmlFor="bedrijfsnaam" className="text-foreground">Bedrijfsnaam</Label>
              <Input
                id="bedrijfsnaam"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                placeholder="Voer bedrijfsnaam in"
                className="bg-background/50 border-border"
              />
            </div>

            {/* Pakket */}
            <div className="space-y-2">
              <Label htmlFor="pakket" className="text-foreground">Pakket</Label>
              <Select value={pakket} onValueChange={setPakket}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Selecteer pakket" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="A">Pakket A</SelectItem>
                  <SelectItem value="B">Pakket B</SelectItem>
                  <SelectItem value="C">Pakket C</SelectItem>
                  <SelectItem value="D">Pakket D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start datum */}
            <div className="space-y-2">
              <Label className="text-foreground">Start datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/50 border-border",
                      !startDatum && "text-muted-foreground"
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
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fases */}
            <div className="space-y-3">
              <Label className="text-foreground">Fases (selecteer minimaal 1)</Label>
              <div className="space-y-2">
                {FASES.map((fase) => (
                  <div key={fase.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={fase.id}
                      checked={selectedFases.includes(fase.id)}
                      onCheckedChange={() => handleFaseToggle(fase.id)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={fase.id} 
                      className="text-muted-foreground cursor-pointer"
                    >
                      {fase.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verzenden...
                </>
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

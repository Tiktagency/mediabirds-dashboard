import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompleteProfileModalProps {
  open: boolean;
  userId: string;
  onCompleted: () => void;
}

export const CompleteProfileModal = ({ open, userId, onCompleted }: CompleteProfileModalProps) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Fout",
        description: "Vul zowel je voornaam als achternaam in",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName.trim(), last_name: lastName.trim() })
        .eq('id', userId);

      if (error) throw error;

      toast({ title: "Profiel opgeslagen", description: "Je naam is succesvol opgeslagen." });
      onCompleted();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon profiel niet opslaan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Profiel voltooien</DialogTitle>
          <DialogDescription>Vul je voornaam en achternaam in om verder te gaan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground">Voornaam</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Voornaam"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Achternaam</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Achternaam"
              className="bg-background border-border text-foreground"
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving || !firstName.trim() || !lastName.trim()} className="w-full">
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

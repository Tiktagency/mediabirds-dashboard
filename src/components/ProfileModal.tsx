import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const ProfileModal = ({ open, onOpenChange, user }: ProfileModalProps) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (open && user) {
      supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const firstName = data?.first_name || '';
          const lastName = data?.last_name || '';
          setFirstName(firstName);
          setLastName(lastName);
          setOriginalFirstName(firstName);
          setOriginalLastName(lastName);
        });
    }
  }, [open, user]);

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "Fout", description: "Vul beide velden in", variant: "destructive", duration: 7000 });
      return;
    }
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName.trim(), last_name: lastName.trim() })
        .eq('id', user!.id);
      if (error) throw error;
      toast({ title: "Opgeslagen", description: "Naam succesvol bijgewerkt", duration: 7000 });
    } catch (error: any) {
      toast({ title: "Fout", description: error.message || "Kon naam niet opslaan", variant: "destructive", duration: 7000 });
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Fout", description: "Wachtwoorden komen niet overeen", variant: "destructive", duration: 7000 });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Fout", description: "Wachtwoord moet minimaal 8 tekens bevatten", variant: "destructive", duration: 7000 });
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Succes", description: "Wachtwoord succesvol gewijzigd", duration: 7000 });
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Fout", description: error.message || "Kon wachtwoord niet wijzigen", variant: "destructive", duration: 7000 });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Mijn Profiel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Name fields */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium">Naam</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Voornaam</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Voornaam"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Achternaam</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Achternaam"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Button onClick={handleSaveName} disabled={isSavingName || !firstName.trim() || !lastName.trim() || (firstName === originalFirstName && lastName === originalLastName)} className="w-full">
              {isSavingName ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-foreground">E-mailadres</Label>
            <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium">Wachtwoord wijzigen</Label>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Nieuw wachtwoord</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nieuw wachtwoord" className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Bevestig wachtwoord</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Bevestig wachtwoord" className="bg-background border-border text-foreground" />
            </div>
            <Button onClick={handlePasswordChange} disabled={isUpdating || !newPassword || !confirmPassword} className="w-full">
              {isUpdating ? 'Bezig...' : 'Wachtwoord wijzigen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
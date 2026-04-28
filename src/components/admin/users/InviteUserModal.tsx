import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Loader2 } from 'lucide-react';
import { AppRole } from '@/hooks/useUserManagement';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const InviteUserModal = ({ open, onOpenChange, onSuccess }: InviteUserModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        title: 'Fout',
        description: 'Vul een e-mailadres in',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), role },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Er is een fout opgetreden');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: 'Succes',
        description: `Uitnodiging voor ${email} is verstuurd`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Invite error:', error);
      toast({
        title: 'Fout',
        description: error.message || 'Kon gebruiker niet uitnodigen',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('viewer');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gebruiker uitnodigen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="gebruiker@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer - Alleen bekijken</SelectItem>
                <SelectItem value="operator">Operator - Kan automations uitvoeren</SelectItem>
                <SelectItem value="admin">Admin - Volledige toegang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuleren
            </Button>
            <Button onClick={handleInvite} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uitnodigen...
                </>
              ) : (
                'Uitnodigen'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Loader2, Copy, Check, Mail, AlertCircle } from 'lucide-react';
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
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('invite-user', {
        body: { 
          email: email.trim(), 
          role,
          redirectUrl: window.location.origin 
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Er is een fout opgetreden');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setTempPassword(response.data.tempPassword);
      setEmailSent(response.data.emailSent || false);
      setEmailError(response.data.emailError || null);
      
      toast({
        title: 'Succes',
        description: response.data.emailSent 
          ? `Gebruiker ${email} is uitgenodigd en e-mail is verzonden`
          : `Gebruiker ${email} is aangemaakt`,
      });

      onSuccess();
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

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('viewer');
    setTempPassword(null);
    setCopied(false);
    setEmailSent(false);
    setEmailError(null);
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

        {tempPassword ? (
          <div className="space-y-4">
            {/* Email status */}
            {emailSent ? (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-green-400 font-medium">
                    E-mail verzonden!
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  De uitnodiging is verstuurd naar het opgegeven e-mailadres met inloggegevens.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm text-yellow-400 font-medium">
                    Gebruiker aangemaakt, e-mail niet verzonden
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailError || 'Deel het wachtwoord handmatig met de gebruiker.'}
                </p>
              </div>
            )}

            {/* Password section */}
            <div className="rounded-lg bg-muted/50 border border-border p-4">
              <p className="text-sm font-medium mb-2">
                Tijdelijk wachtwoord (backup)
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                De gebruiker kan dit wachtwoord wijzigen na inloggen.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background/50 px-3 py-2 rounded text-sm font-mono">
                  {tempPassword}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleClose}>Sluiten</Button>
            </DialogFooter>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
};

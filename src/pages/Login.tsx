import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';

const WHITELISTED_EMAILS = [
  'lotte.seinen@mediabirds.nl',
  'joost.van.milligen@mediabirds.nl',
  'hello@tikt.ai'
];

const loginSchema = z.object({
  email: z.string().email({ message: "Ongeldig e-mailadres" }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens bevatten" }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Ongeldig e-mailadres" }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens bevatten" }),
  confirmPassword: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens bevatten" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roles) {
          navigate('/');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validatiefout",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Inloggen mislukt",
            description: "Ongeldige e-mail of wachtwoord",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Fout",
            description: error.message,
          });
        }
        return;
      }

      if (data.session) {
        // Check if user has admin role
        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          console.error('Role check error:', roleError);
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Toegang geweigerd",
            description: "Fout bij het controleren van rechten",
          });
          return;
        }

        if (!roles) {
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Toegang geweigerd",
            description: "Je hebt geen admin-rechten",
          });
          return;
        }

        toast({
          title: "Inloggen gelukt",
          description: "Welkom terug!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is iets misgegaan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = signupSchema.safeParse({ email, password, confirmPassword });
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validatiefout",
        description: validation.error.errors[0].message,
      });
      return;
    }

    // Check whitelist
    if (!WHITELISTED_EMAILS.includes(email.toLowerCase().trim())) {
      toast({
        variant: "destructive",
        title: "Toegang geweigerd",
        description: "Dit email adres is niet geautoriseerd voor registratie",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Registratie mislukt",
            description: "Dit email adres is al geregistreerd",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Fout",
            description: error.message,
          });
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Registratie gelukt",
          description: "Je account is aangemaakt en je bent ingelogd!",
        });
        navigate('/');
      } else {
        toast({
          title: "Registratie gelukt",
          description: "Je account is aangemaakt. Je kunt nu inloggen.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is iets misgegaan bij de registratie",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Mediabirds</h1>
          <p className="mt-2 text-muted-foreground">Admin Toegang</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Inloggen</TabsTrigger>
            <TabsTrigger value="signup">Registreren</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mailadres</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Wachtwoord</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Inloggen...' : 'Inloggen'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">E-mailadres</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Alleen geautoriseerde email adressen kunnen registreren
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Wachtwoord</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Bevestig wachtwoord</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Registreren...' : 'Registreren'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;

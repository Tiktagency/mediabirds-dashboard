import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Ongeldig e-mailadres" }),
  password: z.string().min(1, { message: "Wachtwoord is verplicht" }),
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has any role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roles && roles.length > 0) {
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
        // Check if user has any role
        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.session.user.id);

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

        if (!roles || roles.length === 0) {
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Toegang geweigerd",
            description: "Je hebt geen toegangsrechten. Neem contact op met een admin.",
          });
          return;
        }

        const roleNames = roles.map(r => r.role).join(', ');
        toast({
          title: "Inloggen gelukt",
          description: `Welkom terug! (${roleNames})`,
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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#CFDDCF' }}>
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h1 
            className="text-3xl text-foreground"
            style={{ fontFamily: "'Denton', serif", fontStyle: 'italic' }}
          >
            Mediabirds
          </h1>
          <p className="mt-2 text-muted-foreground">Dashboard Toegang</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mailadres</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="jouw@email.nl"
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
        
        <p className="text-xs text-center text-muted-foreground">
          Geen account? Neem contact op met een admin om toegang te krijgen.
        </p>
      </div>
    </div>
  );
};

export default Login;

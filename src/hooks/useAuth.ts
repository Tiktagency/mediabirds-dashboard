import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'admin' | 'operator' | 'viewer';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isSuperAdmin = roles.includes('super_admin');
  const isOperator = roles.includes('operator');
  const isViewer = roles.includes('viewer');

  const fetchRoles = async (userId: string): Promise<UserRole[]> => {
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    return (userRoles || []).map(r => r.role as UserRole);
  };

  useEffect(() => {
    let isMounted = true;

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const roleList = await fetchRoles(currentSession.user.id);
        if (!isMounted) return;
        setRoles(roleList);
        if (roleList.length === 0) {
          await supabase.auth.signOut();
          navigate('/login');
        }
      } else {
        navigate('/login');
      }

      setIsLoading(false);
      setInitialized(true);
    });

    // Listen for auth changes AFTER initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!initialized && event === 'INITIAL_SESSION') return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setTimeout(async () => {
            const roleList = await fetchRoles(currentSession.user.id);
            if (!isMounted) return;
            setRoles(roleList);
            if (roleList.length === 0) {
              await supabase.auth.signOut();
              navigate('/login');
            }
          }, 0);
        } else {
          setRoles([]);
          navigate('/login');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return { 
    user, 
    session, 
    roles, 
    isAdmin,
    isSuperAdmin,
    isOperator, 
    isViewer, 
    isLoading, 
    signOut 
  };
};

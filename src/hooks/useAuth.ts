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
  const navigate = useNavigate();

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isSuperAdmin = roles.includes('super_admin');
  const isOperator = roles.includes('operator');
  const isViewer = roles.includes('viewer');

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Fetch user roles with setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data: userRoles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id);

            const roleList = (userRoles || []).map(r => r.role as UserRole);
            setRoles(roleList);
            
            // If user has no roles, they cannot access the dashboard
            if (roleList.length === 0) {
              await supabase.auth.signOut();
              navigate('/login');
            }
            
            setIsLoading(false);
          }, 0);
        } else {
          setRoles([]);
          setIsLoading(false);
          navigate('/login');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentSession.user.id);

        const roleList = (userRoles || []).map(r => r.role as UserRole);
        setRoles(roleList);
        
        // If user has no roles, they cannot access the dashboard
        if (roleList.length === 0) {
          await supabase.auth.signOut();
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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

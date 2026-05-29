import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns true when the currently logged-in user is flagged as a demo account
 * (profiles.is_demo = true). Demo users have full read access but cannot start
 * automations or perform write actions.
 */
export const useIsDemoUser = () => {
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDemo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mounted) {
          setIsDemo(false);
          setIsLoading(false);
        }
        return;
      }
      const email = session.user.email?.toLowerCase();
      const isDemoEmail = email === 'luc.degraag@student.hu.nl';
      const { data } = await supabase
        .from('profiles')
        .select('is_demo')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!mounted) return;
      setIsDemo(isDemoEmail || !!data?.is_demo);
      setIsLoading(false);
    };

    fetchDemo();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchDemo();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isDemo, isLoading };
};

export const DEMO_TOOLTIP = 'Demo-account: automatiseringen starten is uitgeschakeld';

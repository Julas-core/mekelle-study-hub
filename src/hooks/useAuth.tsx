import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser?.id) {
        checkAdminStatus(clerkUser.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }
  }, [clerkUser?.id, isLoaded]);

  const signOut = async () => {
    await clerkSignOut();
    setIsAdmin(false);
  };

  return {
    user: clerkUser,
    session: clerkUser ? { user: clerkUser } : null,
    loading: !isLoaded || loading,
    isAdmin,
    signOut,
  };
};

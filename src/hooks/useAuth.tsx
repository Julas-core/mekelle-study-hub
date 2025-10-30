import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);

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
    if (isLoaded && clerkUser) {
      checkAdminStatus(clerkUser.id);
    } else {
      setIsAdmin(false);
    }
  }, [isLoaded, clerkUser]);

  return {
    user: clerkUser ? {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      full_name: clerkUser.fullName || '',
    } : null,
    session: clerkUser ? { user: clerkUser } : null,
    loading: !isLoaded,
    isAdmin,
    signOut: clerkSignOut,
  };
};

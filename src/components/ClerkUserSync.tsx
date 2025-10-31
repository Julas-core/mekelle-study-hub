import { useEffect } from 'react';
import { useUser, useSession } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const ClerkUserSync = () => {
  const { user, isLoaded } = useUser();
  const { session } = useSession();

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isLoaded || !user || !session) return;

      try {
        // Get the Supabase token from Clerk session
        const supabaseToken = await session.getToken({ template: 'supabase' });
        
        if (!supabaseToken) {
          console.error('Failed to get Supabase token from Clerk');
          return;
        }

        // Set the token for Supabase client
        await supabase.auth.setSession({
          access_token: supabaseToken,
          refresh_token: '',
        });

        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const profileData = {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          full_name: user.fullName || '',
          avatar_url: user.imageUrl || null,
          updated_at: new Date().toISOString(),
        };

        if (existingProfile) {
          // Update existing profile with Clerk data including photo
          await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);
        } else {
          // Create new profile
          await supabase
            .from('profiles')
            .insert({
              ...profileData,
              created_at: new Date().toISOString(),
            });
        }
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUserToSupabase();
  }, [user, isLoaded, session]);

  return null;
};


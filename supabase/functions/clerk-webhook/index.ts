import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Clerk webhook payload:', payload);

    const { type, data } = payload;

    // Handle user creation
    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = data;
      const email = email_addresses[0]?.email_address;
      const fullName = `${first_name || ''} ${last_name || ''}`.trim();

      // Create profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id,
          email,
          full_name: fullName,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      console.log('Profile created for user:', id);
    }

    // Handle user updates
    if (type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = data;
      const email = email_addresses[0]?.email_address;
      const fullName = `${first_name || ''} ${last_name || ''}`.trim();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email,
          full_name: fullName,
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('Profile updated for user:', id);
    }

    // Handle user deletion
    if (type === 'user.deleted') {
      const { id } = data;

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting profile:', deleteError);
        throw deleteError;
      }

      console.log('Profile deleted for user:', id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

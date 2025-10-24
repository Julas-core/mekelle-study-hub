import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CreateVerificationTokenParams {
  userId: string;
  email: string;
}

export const createVerificationToken = async ({
  userId,
  email
}: CreateVerificationTokenParams): Promise<{ token: string; error?: string }> => {
  try {
    // Generate a unique token
    const token = nanoid(32); // 32-character random string
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Insert the token into the database
    const { error } = await supabase
      .from('email_verification_tokens')
      .insert([
        {
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating verification token:', error);
      return { token: '', error: error.message };
    }
    
    return { token };
  } catch (error) {
    console.error('Error in createVerificationToken:', error);
    return { token: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const verifyEmailToken = async (token: string): Promise<{ success: boolean; userId?: string; userEmail?: string; error?: string }> => {
  try {
    // Find the token in the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();
    
    if (tokenError || !tokenData) {
      console.error('Token lookup error:', tokenError);
      return { success: false, error: 'Invalid or expired verification token' };
    }
    
    // Check if the token has expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      // Token has expired, delete it
      await supabase
        .from('email_verification_tokens')
        .delete()
        .eq('token', token);
      
      return { success: false, error: 'Verification token has expired' };
    }
    
    // Verify that the user exists in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', tokenData.user_id)
      .single();
    
    if (profileError || !profileData) {
      console.error('Profile lookup error:', profileError);
      return { success: false, error: 'User profile not found' };
    }
    
    // Update the profile to mark email as confirmed
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        email_confirmed_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id);
    
    if (updateError) {
      console.error('Error updating profile after verification:', updateError);
      return { success: false, error: updateError.message };
    }
    
    // Delete the used token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);
    
    return { success: true, userId: tokenData.user_id, userEmail: profileData.email };
  } catch (error) {
    console.error('Error in verifyEmailToken:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const deleteExpiredTokens = async (): Promise<void> => {
  try {
    await supabase.rpc('cleanup_expired_verification_tokens');
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};
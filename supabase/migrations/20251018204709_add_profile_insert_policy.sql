-- Add INSERT policy for profiles table
-- 
-- This migration adds the missing INSERT policy for the profiles table.
-- Without this policy, users cannot create their profile records through upsert.
-- 
-- Security:
-- - Only authenticated users can insert profiles
-- - Users can only insert their own profile (auth.uid() = id)

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

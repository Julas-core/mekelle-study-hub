-- Fix profiles table RLS - restrict to authenticated users viewing own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Make storage buckets private
UPDATE storage.buckets
SET public = false
WHERE name IN ('course-materials', 'avatars');

-- Add RLS policies for storage
CREATE POLICY "Authenticated users can view course materials"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view avatars"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- Update is_admin_email function to use user_roles table instead of hardcoded emails
CREATE OR REPLACE FUNCTION public.is_admin_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  is_admin boolean;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE auth.users.email = is_admin_email.email
  LIMIT 1;
  
  -- Check if user has admin role
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin_email.user_id
    AND user_roles.role = 'admin'
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$;
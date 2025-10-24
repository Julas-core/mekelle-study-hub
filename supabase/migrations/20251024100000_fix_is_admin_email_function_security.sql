-- Fix function search path for security
DROP FUNCTION IF EXISTS public.is_admin_email(text);

CREATE OR REPLACE FUNCTION public.is_admin_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    WHERE user_roles.user_id = user_id
    AND user_roles.role = 'admin'
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- Fix search_path for is_admin_email function to prevent potential SQL injection
-- This addresses the function_search_path_mutable security warning

-- Drop and recreate the is_admin_email(email text) function with search_path set
DROP FUNCTION IF EXISTS public.is_admin_email(email text);

CREATE OR REPLACE FUNCTION public.is_admin_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;
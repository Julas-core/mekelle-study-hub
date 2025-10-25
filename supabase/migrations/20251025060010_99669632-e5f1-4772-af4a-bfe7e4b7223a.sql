-- Update is_admin_email function to check user_roles table instead of hardcoded emails
-- Using CREATE OR REPLACE to avoid dropping dependencies
CREATE OR REPLACE FUNCTION public.is_admin_email(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
    AND role = 'admin'::app_role
  );
END;
$$;
-- Add RLS policies for user_roles table
-- Users can view all roles (needed to check admin status)
CREATE POLICY "Anyone can view user roles"
  ON public.user_roles FOR SELECT
  USING (true);

-- Only admins can insert new roles
CREATE POLICY "Only admins can assign roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
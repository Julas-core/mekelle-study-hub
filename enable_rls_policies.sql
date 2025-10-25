-- Enable RLS on materials table (this needs to be done before creating policies)
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table (addressing the security warning)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- For the materials table, update policies to allow uploads by all authenticated users
-- First, drop existing policies that restrict to admins
DROP POLICY IF EXISTS "Only admins can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Only admins can update materials" ON public.materials;
DROP POLICY IF EXISTS "Only admins can delete materials" ON public.materials;

-- Create new policies that allow all authenticated users to insert materials
CREATE POLICY "Allow all authenticated users to insert materials" ON public.materials
FOR INSERT TO authenticated
WITH CHECK (true);

-- For update and delete, restrict to the original uploader
CREATE POLICY "Allow users to update own materials" ON public.materials
FOR UPDATE TO authenticated
USING (uploaded_by_user_id = auth.uid());

CREATE POLICY "Allow users to delete own materials" ON public.materials
FOR DELETE TO authenticated
USING (uploaded_by_user_id = auth.uid());

-- Create policy for profiles table to allow users to see and modify only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
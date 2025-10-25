-- First, make sure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- For the materials table, let's check if it exists in public schema
-- If the previous command failed, it might be under a different schema or name
-- Let's create the policies assuming the table exists and RLS is enabled

-- Enable RLS on materials table if it exists
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- First, drop the existing admin-only insert policy
DROP POLICY IF EXISTS "Only admins can insert materials" ON public.materials;

-- Create a new policy that allows all authenticated users to insert materials
CREATE POLICY "Allow all authenticated users to insert materials" ON public.materials
FOR INSERT TO authenticated
WITH CHECK (true);

-- For update and delete, restrict to only the uploader or admins
-- First drop existing policies
DROP POLICY IF EXISTS "Only admins can update materials" ON public.materials;
DROP POLICY IF EXISTS "Only admins can delete materials" ON public.materials;

-- Create new policies that allow users to update/delete their own materials
CREATE POLICY "Allow users to update own materials" ON public.materials
FOR UPDATE TO authenticated
USING (uploaded_by_user_id = auth.uid());

CREATE POLICY "Allow users to delete own materials" ON public.materials
FOR DELETE TO authenticated
USING (uploaded_by_user_id = auth.uid());

-- Update storage policies to allow all users to upload to storage
DROP POLICY IF EXISTS "Only admins can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update course materials" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete course materials" ON storage.objects;

-- Create new policies that allow authenticated users to upload to course-materials bucket
CREATE POLICY "Allow all users to upload course materials" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials');

-- For update/delete operations in storage
CREATE POLICY "Allow authenticated users to update course materials" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'course-materials');

CREATE POLICY "Allow authenticated users to delete course materials" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'course-materials');
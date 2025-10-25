-- Update RLS policies to allow all authenticated users to upload materials

-- First, drop the existing admin-only insert policy
DROP POLICY IF EXISTS "Only admins can insert materials" ON public.materials;

-- Create a new policy that allows all authenticated users to insert materials
CREATE POLICY "Allow all authenticated users to insert materials" ON public.materials
FOR INSERT TO authenticated
WITH CHECK (true);

-- For update and delete, we might want to restrict to only the uploader or admins
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

-- We also need to update the storage policies to allow all users to upload to storage
DROP POLICY IF EXISTS "Only admins can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update course materials" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete course materials" ON storage.objects;

-- Create new policies that allow authenticated users to upload to course-materials bucket
CREATE POLICY "Allow all users to upload course materials" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to update own course materials" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'course-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to delete own course materials" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'course-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
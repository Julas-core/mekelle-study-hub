-- Remove conflicting RLS policies to allow all authenticated users to upload materials
-- Keeping the policy that allows all authenticated users to insert materials
-- Removing the admin-only policy to resolve the conflict

-- Drop the admin-only insert policy
DROP POLICY IF EXISTS "Only admins can insert materials" ON public.materials;

-- Also drop admin-only update and delete policies
DROP POLICY IF EXISTS "Only admins can update materials" ON public.materials;
DROP POLICY IF EXISTS "Only admins can delete materials" ON public.materials;

-- For storage, also remove the admin-only policy to allow all authenticated users
DROP POLICY IF EXISTS "Only admins can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course materials" ON storage.objects;
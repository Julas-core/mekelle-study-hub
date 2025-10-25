-- Allow all authenticated users to upload materials to the database
DROP POLICY IF EXISTS "Allow all authenticated users to insert materials" ON materials;

CREATE POLICY "Authenticated users can insert materials" ON materials
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = uploaded_by_user_id);

-- Allow all authenticated users to upload to storage
DROP POLICY IF EXISTS "Allow all users to upload course materials" ON storage.objects;

CREATE POLICY "Authenticated users can upload materials" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials');
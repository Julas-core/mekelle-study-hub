-- Add Profile Columns and Avatar Storage
-- 
-- 1. Profile Table Updates
--    - Add department column for user's department
--    - Add student_id column for student/employee ID
--    - Add avatar_url column for profile picture URL
-- 
-- 2. Storage Bucket Creation
--    - Create avatars bucket for user profile pictures
--    - Enable public read access for avatars
-- 
-- 3. Storage RLS Policies
--    - Public can view all avatars
--    - Authenticated users can upload to their own folder (user_id/*)
--    - Authenticated users can update files in their own folder
--    - Authenticated users can delete files in their own folder
-- 
-- 4. Security
--    - Folder-based isolation using auth.uid() in path
--    - Each user has their own folder: {user_id}/filename
--    - Only the user who owns the folder can upload/update/delete

-- Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for avatars bucket

-- Allow public read access to all avatars
CREATE POLICY "Public read access for avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload files in their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update files in their own folder
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete files in their own folder
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

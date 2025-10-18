/*
  # Initial Database Schema

  1. **User Roles System**
     - `app_role` enum with admin, moderator, user roles
     - `user_roles` table to track user role assignments
     - `has_role()` function to check user permissions

  2. **Profiles Table**
     - `id` (uuid, primary key, references auth.users)
     - `email` (text)
     - `full_name` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **Materials Table**
     - Stores course materials metadata
     - Includes title, description, department, course info
     - Links to uploaded files and user who uploaded
  
  4. **Storage Buckets**
     - `course-materials` bucket for course files
  
  5. **Security**
     - RLS enabled on all tables
     - Profiles: Users can view all, update own
     - Materials: Anyone can view, only admins can modify
     - Automatic profile creation on user signup via trigger
*/

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  course TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- RLS policies for materials (everyone can read, only admins can write)
CREATE POLICY "Anyone can view materials"
  ON public.materials FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert materials"
  ON public.materials FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update materials"
  ON public.materials FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete materials"
  ON public.materials FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (everyone can read, only admins can upload)
CREATE POLICY "Anyone can view course materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-materials');

CREATE POLICY "Only admins can upload course materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-materials' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can update course materials"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'course-materials' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can delete course materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-materials' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

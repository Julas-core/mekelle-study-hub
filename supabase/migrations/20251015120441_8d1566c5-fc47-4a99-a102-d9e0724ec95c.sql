-- 1) Create function to check admin emails (hardcoded)
create or replace function public.is_admin_email(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  admin_emails text[] := array['codingjulas@gmail.com', 'julasmame@gmail.com'];
begin
  select email into user_email from auth.users where id = p_user_id;
  return user_email = any(admin_emails);
end;
$$;

-- 2) Replace materials RLS policies to use email-based admin check
drop policy if exists "Only admins can insert materials" on public.materials;
create policy "Only admins can insert materials"
  on public.materials for insert
  with check (public.is_admin_email(auth.uid()));

drop policy if exists "Only admins can update materials" on public.materials;
create policy "Only admins can update materials"
  on public.materials for update
  using (public.is_admin_email(auth.uid()));

drop policy if exists "Only admins can delete materials" on public.materials;
create policy "Only admins can delete materials"
  on public.materials for delete
  using (public.is_admin_email(auth.uid()));

-- 3) Replace storage policies for the 'course-materials' bucket
-- INSERT
drop policy if exists "Only admins can upload course materials" on storage.objects;
create policy "Only admins can upload course materials"
  on storage.objects for insert
  with check (
    bucket_id = 'course-materials'
    and public.is_admin_email(auth.uid())
  );

-- UPDATE
drop policy if exists "Only admins can update course materials" on storage.objects;
create policy "Only admins can update course materials"
  on storage.objects for update
  using (
    bucket_id = 'course-materials'
    and public.is_admin_email(auth.uid())
  );

-- DELETE
drop policy if exists "Only admins can delete course materials" on storage.objects;
create policy "Only admins can delete course materials"
  on storage.objects for delete
  using (
    bucket_id = 'course-materials'
    and public.is_admin_email(auth.uid())
  );
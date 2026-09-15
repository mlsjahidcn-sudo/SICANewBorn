-- Restore the private bucket used by the public assessment transcript flow.
-- The application creates signed upload/download URLs with the service-role
-- client, while authenticated admins may read and delete objects through RLS.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'transcripts',
  'transcripts',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read all transcripts" on storage.objects;
create policy "Admins can read all transcripts"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'transcripts'
    and public.is_admin_for_storage()
  );

drop policy if exists "Admins can delete transcripts" on storage.objects;
create policy "Admins can delete transcripts"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'transcripts'
    and public.is_admin_for_storage()
  );

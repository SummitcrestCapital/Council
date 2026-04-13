-- Fix "new row violates row-level security policy for table spaces" when creating a club.
-- Root cause: spaces_insert_owner requires owner_id = auth.uid(), but owner_id had no default.
-- If the client insert omits owner_id, the row is rejected by RLS.

alter table public.spaces
  alter column owner_id set default auth.uid();

-- Recreate insert policy to keep semantics explicit.
drop policy if exists "spaces_insert_owner" on public.spaces;

create policy "spaces_insert_owner"
on public.spaces
for insert
to authenticated
with check (owner_id = auth.uid());

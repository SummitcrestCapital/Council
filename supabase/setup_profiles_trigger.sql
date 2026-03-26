-- Run this in your Supabase SQL editor.
-- It keeps public.profiles in sync whenever a new auth user is created.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, created_at, onboarding_complete)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data ->> 'username'),
    new.raw_user_meta_data ->> 'full_name',
    new.created_at,
    false
  )
  on conflict (id) do update
    set username = excluded.username,
        full_name = excluded.full_name,
        created_at = excluded.created_at;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  email text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  plan_status text not null default 'active' check (plan_status in ('active', 'cancelled', 'past_due')),
  plan_expires_at timestamptz,
  dodo_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

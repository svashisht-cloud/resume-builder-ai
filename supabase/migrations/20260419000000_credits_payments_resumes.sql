-- ============================================================
-- Phase 1: credits, payments, resumes tables + RPCs
-- ============================================================

-- 1. Alter profiles: drop billing columns, add credits cache
alter table public.profiles
  drop column if exists plan,
  drop column if exists plan_status,
  drop column if exists plan_expires_at,
  add column if not exists credits_remaining int not null default 0;

-- 2. Resumes table
create table if not exists public.resumes (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  job_description_hash text       not null,
  job_title           text,
  company_name        text,
  regen_count         int         not null default 0,
  created_at          timestamptz not null default now(),
  last_generated_at   timestamptz not null default now(),
  unique (user_id, job_description_hash)
);

create index if not exists resumes_user_idx on public.resumes (user_id, created_at desc);

alter table public.resumes enable row level security;

create policy "Users can read own resumes"
  on public.resumes for select using (auth.uid() = user_id);

-- 3. Payments table
create table if not exists public.payments (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  dodo_payment_id   text        not null unique,
  dodo_customer_id  text,
  product           text        not null check (product in ('resume_pack', 'resume_pack_plus')),
  amount_cents      int         not null,
  currency          text        not null default 'usd',
  credits_granted   int         not null,
  status            text        not null default 'succeeded'
                                check (status in ('succeeded', 'refunded', 'disputed')),
  paid_at           timestamptz not null default now(),
  refunded_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id, paid_at desc);

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select using (auth.uid() = user_id);

-- 4. Credits table
create table if not exists public.credits (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  source               text        not null check (source in ('free_signup', 'resume_pack', 'resume_pack_plus', 'admin_grant')),
  payment_id           uuid        references public.payments(id) on delete set null,
  granted_at           timestamptz not null default now(),
  expires_at           timestamptz not null,
  spent_at             timestamptz,
  spent_on_resume_id   uuid        references public.resumes(id) on delete set null,
  created_at           timestamptz not null default now()
);

create index if not exists credits_user_unspent_idx
  on public.credits (user_id, expires_at)
  where spent_at is null;

alter table public.credits enable row level security;

create policy "Users can read own credits"
  on public.credits for select using (auth.uid() = user_id);

-- 5. Trigger: keep profiles.credits_remaining in sync
create or replace function public.refresh_credits_remaining()
returns trigger as $$
declare
  target_user uuid;
begin
  target_user := coalesce(new.user_id, old.user_id);
  update public.profiles
  set credits_remaining = (
    select count(*) from public.credits
    where user_id = target_user
      and spent_at is null
      and expires_at > now()
  )
  where id = target_user;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger credits_refresh_count
  after insert or update or delete on public.credits
  for each row execute procedure public.refresh_credits_remaining();

-- 6. Update handle_new_user to grant free credit on signup
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

  insert into public.credits (user_id, source, expires_at)
  values (new.id, 'free_signup', now() + interval '12 months');

  return new;
end;
$$ language plpgsql security definer;

-- 7. Backfill: grant free credit to existing users who have none
insert into public.credits (user_id, source, expires_at)
select p.id, 'free_signup', now() + interval '12 months'
from public.profiles p
where not exists (
  select 1 from public.credits c where c.user_id = p.id
);

-- 8. RPC: spend_credit — atomic, race-safe, FIFO by expiry
create or replace function public.spend_credit(p_resume_id uuid)
returns uuid as $$
declare
  credit_id   uuid;
  caller      uuid;
  owns_resume boolean;
begin
  caller := auth.uid();
  if caller is null then
    raise exception 'not authenticated';
  end if;

  select exists(select 1 from public.resumes where id = p_resume_id and user_id = caller)
    into owns_resume;
  if not owns_resume then
    raise exception 'resume not found or not owned by caller';
  end if;

  select id into credit_id
  from public.credits
  where user_id = caller
    and spent_at is null
    and expires_at > now()
  order by expires_at asc
  limit 1
  for update skip locked;

  if credit_id is null then
    raise exception 'no credits available' using errcode = 'P0001';
  end if;

  update public.credits
  set spent_at = now(), spent_on_resume_id = p_resume_id
  where id = credit_id;

  return credit_id;
end;
$$ language plpgsql security definer;

-- 9. RPC: start_or_regen_resume — single entrypoint for the tailoring API
create or replace function public.start_or_regen_resume(
  p_jd_hash     text,
  p_job_title   text,
  p_company_name text
)
returns table (resume_id uuid, is_regen boolean, regen_count int) as $$
declare
  existing_id    uuid;
  existing_count int;
  new_id         uuid;
  caller         uuid;
begin
  caller := auth.uid();
  if caller is null then
    raise exception 'not authenticated';
  end if;

  select id, regen_count into existing_id, existing_count
  from public.resumes
  where user_id = caller and job_description_hash = p_jd_hash;

  if existing_id is not null then
    if existing_count >= 2 then
      raise exception 'regen limit reached' using errcode = 'P0002';
    end if;

    update public.resumes
    set regen_count = regen_count + 1,
        last_generated_at = now()
    where id = existing_id;

    return query select existing_id, true, existing_count + 1;
    return;
  end if;

  -- New resume: insert row then spend a credit (rolls back atomically if no credits)
  insert into public.resumes (user_id, job_description_hash, job_title, company_name)
  values (caller, p_jd_hash, p_job_title, p_company_name)
  returning id into new_id;

  perform public.spend_credit(new_id);

  return query select new_id, false, 0;
end;
$$ language plpgsql security definer;

-- 10. RPC: mock_purchase_credits — removed when real Dodo integration lands
create or replace function public.mock_purchase_credits(p_product text)
returns uuid as $$
declare
  caller        uuid;
  credits_count int;
  price_cents   int;
  payment_id    uuid;
  i             int;
begin
  caller := auth.uid();
  if caller is null then
    raise exception 'not authenticated';
  end if;

  if p_product = 'resume_pack' then
    credits_count := 3; price_cents := 1900;
  elsif p_product = 'resume_pack_plus' then
    credits_count := 10; price_cents := 4900;
  else
    raise exception 'invalid product: %', p_product;
  end if;

  insert into public.payments (
    user_id, dodo_payment_id, product, amount_cents, credits_granted
  ) values (
    caller, 'mock_' || gen_random_uuid()::text, p_product, price_cents, credits_count
  ) returning id into payment_id;

  for i in 1..credits_count loop
    insert into public.credits (user_id, source, payment_id, expires_at)
    values (caller, p_product, payment_id, now() + interval '12 months');
  end loop;

  return payment_id;
end;
$$ language plpgsql security definer;

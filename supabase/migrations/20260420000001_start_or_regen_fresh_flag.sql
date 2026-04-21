-- Supersedes 20260420000000_fix_regen_count_ambiguous.sql.
-- Adds p_force_fresh boolean: when true (fresh "Tailor Resume" submission),
-- an existing row for the same JD hash is reset instead of blocked by the
-- regen limit. Fixes: regen limit incorrectly raised on fresh tailors.
-- Also carries the regen_count ambiguous-column fix (use existing_count + 1).
create or replace function public.start_or_regen_resume(
  p_jd_hash      text,
  p_job_title    text,
  p_company_name text,
  p_force_fresh  boolean default false
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

  select id, r.regen_count into existing_id, existing_count
  from public.resumes r
  where r.user_id = caller and r.job_description_hash = p_jd_hash;

  if existing_id is not null then
    if p_force_fresh then
      -- Fresh tailor on an existing JD: reset regen count and spend a credit.
      update public.resumes
      set regen_count = 0,
          last_generated_at = now()
      where id = existing_id;
      perform public.spend_credit(existing_id);
      return query select existing_id, false, 0;
      return;
    end if;

    if existing_count >= 2 then
      raise exception 'regen limit reached' using errcode = 'P0002';
    end if;

    update public.resumes
    set regen_count = existing_count + 1,
        last_generated_at = now()
    where id = existing_id;

    return query select existing_id, true, existing_count + 1;
    return;
  end if;

  -- New JD: insert row then spend a credit (rolls back atomically if no credits).
  insert into public.resumes (user_id, job_description_hash, job_title, company_name)
  values (caller, p_jd_hash, p_job_title, p_company_name)
  returning id into new_id;

  perform public.spend_credit(new_id);

  return query select new_id, false, 0;
end;
$$ language plpgsql security definer;

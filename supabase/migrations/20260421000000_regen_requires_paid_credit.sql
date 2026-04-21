-- Regeneration now requires that the credit spent on the original tailor came
-- from a paid pack (resume_pack or resume_pack_plus). Free-signup credits do
-- not unlock regen. Raises P0003 if the constraint is not met.
create or replace function public.start_or_regen_resume(
  p_jd_hash      text,
  p_job_title    text,
  p_company_name text,
  p_force_fresh  boolean default false
)
returns table (resume_id uuid, is_regen boolean, regen_count int) as $$
declare
  existing_id     uuid;
  existing_count  int;
  new_id          uuid;
  caller          uuid;
  has_paid_credit boolean;
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

    -- Regen path: require a paid credit was spent on the original tailor.
    select exists(
      select 1 from public.credits
      where spent_on_resume_id = existing_id
        and source in ('resume_pack', 'resume_pack_plus')
    ) into has_paid_credit;

    if not has_paid_credit then
      raise exception 'paid credit required for regeneration' using errcode = 'P0003';
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

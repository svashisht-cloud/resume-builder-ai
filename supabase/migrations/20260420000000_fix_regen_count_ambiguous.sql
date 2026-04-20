-- Fix: "column reference regen_count is ambiguous" in start_or_regen_resume.
-- The RETURNS TABLE declares regen_count, which shadowed the column reference
-- on the RHS of the UPDATE SET clause. Use existing_count + 1 instead.
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

  select id, r.regen_count into existing_id, existing_count
  from public.resumes r
  where r.user_id = caller and r.job_description_hash = p_jd_hash;

  if existing_id is not null then
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

  -- New resume: insert row then spend a credit (rolls back atomically if no credits)
  insert into public.resumes (user_id, job_description_hash, job_title, company_name)
  values (caller, p_jd_hash, p_job_title, p_company_name)
  returning id into new_id;

  perform public.spend_credit(new_id);

  return query select new_id, false, 0;
end;
$$ language plpgsql security definer;

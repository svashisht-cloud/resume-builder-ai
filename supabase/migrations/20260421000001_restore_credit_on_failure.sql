-- Restore a credit that was spent on a resume that failed to generate.
-- Only restores if spent within the last 5 minutes (safety window against abuse).
-- The credits_refresh_count trigger fires automatically, updating profiles.credits_remaining.
create or replace function public.restore_credit(p_resume_id uuid)
returns void as $$
declare
  caller uuid;
begin
  caller := auth.uid();
  if caller is null then
    raise exception 'not authenticated';
  end if;

  update public.credits
  set spent_at = null, spent_on_resume_id = null
  where spent_on_resume_id = p_resume_id
    and user_id = caller
    and spent_at > now() - interval '5 minutes';
end;
$$ language plpgsql security definer;

revoke execute on function public.restore_credit(uuid) from public;
grant execute on function public.restore_credit(uuid) to authenticated;

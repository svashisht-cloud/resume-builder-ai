ALTER TABLE public.credits
  DROP CONSTRAINT IF EXISTS credits_source_check;

ALTER TABLE public.credits
  ADD CONSTRAINT credits_source_check
    CHECK (source IN (
      'free_signup',
      'resume_pack',
      'resume_pack_plus',
      'admin_grant',
      'courtesy',
      'bug_compensation'
    ));

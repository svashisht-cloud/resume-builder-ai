-- Re-point user_id FKs from auth.users → profiles
-- so PostgREST can resolve profiles(email) joins in admin queries.

ALTER TABLE pipeline_runs DROP CONSTRAINT pipeline_runs_user_id_fkey;
ALTER TABLE pipeline_runs
  ADD CONSTRAINT pipeline_runs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE credits DROP CONSTRAINT credits_user_id_fkey;
ALTER TABLE credits
  ADD CONSTRAINT credits_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'experience_level'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN experience_level text NOT NULL DEFAULT 'mid'
        CHECK (experience_level IN ('junior', 'mid', 'senior'));
  END IF;
END $$;

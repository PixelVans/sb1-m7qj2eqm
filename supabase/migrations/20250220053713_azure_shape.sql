/*
  # Fix DJ Relationship and DJ Profiles

  1. Changes
    - Add foreign key relationship between events and auth.users
    - Create a function to safely access user metadata
    - Create a secure view for DJ profiles

  2. Security
    - Function is marked as STABLE for better query planning
    - View uses SECURITY DEFINER to ensure consistent access
*/

-- Create a function to safely access user metadata
CREATE OR REPLACE FUNCTION public.get_dj_profile(user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT raw_user_meta_data
  FROM auth.users
  WHERE id = user_id;
$$;

-- Create a secure view for DJ profiles
CREATE OR REPLACE VIEW public.dj_profiles AS
SELECT 
  id,
  get_dj_profile(id)->>'dj_name' as dj_name,
  get_dj_profile(id)->>'avatar_url' as avatar_url,
  get_dj_profile(id)->>'bio' as bio,
  get_dj_profile(id)->>'social_links' as social_links
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON public.dj_profiles TO authenticated;
GRANT SELECT ON public.dj_profiles TO anon;

-- Add foreign key relationship if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_dj_id_fkey'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_dj_id_fkey 
    FOREIGN KEY (dj_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;
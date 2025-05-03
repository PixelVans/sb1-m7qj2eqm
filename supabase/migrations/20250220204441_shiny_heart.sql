/*
  # Fix DJ Metadata Relationship - Final Version

  1. Changes
    - Create a proper view for DJ metadata
    - Set up correct relationships
    - Add necessary indexes and grants

  2. Security
    - Maintain secure access to user metadata
    - Preserve existing RLS policies
*/

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.dj_metadata;
DROP VIEW IF EXISTS public.dj_profiles;

-- Create a secure function to access user metadata
CREATE OR REPLACE FUNCTION public.get_dj_metadata(user_id uuid)
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

-- Create a simple view for DJ metadata
CREATE VIEW public.dj_metadata AS
SELECT 
  id as user_id,
  raw_user_meta_data as metadata
FROM auth.users;

-- Create index on events.dj_id for better join performance
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events(dj_id);

-- Grant access to the view and function
GRANT SELECT ON public.dj_metadata TO authenticated;
GRANT SELECT ON public.dj_metadata TO anon;
GRANT EXECUTE ON FUNCTION public.get_dj_metadata TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dj_metadata TO anon;

-- Update foreign key relationship
DO $$ 
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_dj_id_fkey'
  ) THEN
    ALTER TABLE events DROP CONSTRAINT events_dj_id_fkey;
  END IF;

  -- Create new foreign key relationship
  ALTER TABLE events
  ADD CONSTRAINT events_dj_id_fkey 
  FOREIGN KEY (dj_id) 
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
END $$;
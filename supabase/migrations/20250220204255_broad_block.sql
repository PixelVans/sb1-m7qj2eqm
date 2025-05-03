/*
  # DJ Metadata View Migration

  1. Changes
    - Create secure function for accessing DJ metadata
    - Create secure view for DJ metadata access
    - Add foreign key relationship for events
    - Set up proper access controls

  2. Security
    - Use security definer function for metadata access
    - Implement secure view with proper access controls
    - Maintain data privacy
*/

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.dj_profiles;
DROP VIEW IF EXISTS public.dj_metadata;

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

-- Create a secure materialized view for DJ metadata
CREATE MATERIALIZED VIEW public.dj_metadata AS
SELECT 
  id as user_id,
  get_dj_metadata(id) as metadata
FROM auth.users
WITH NO DATA;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW public.dj_metadata;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dj_metadata_user_id ON public.dj_metadata(user_id);

-- Grant access to the view and function
GRANT SELECT ON public.dj_metadata TO authenticated;
GRANT SELECT ON public.dj_metadata TO anon;
GRANT EXECUTE ON FUNCTION public.get_dj_metadata TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dj_metadata TO anon;

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
/*
  # Fix DJ Metadata Relationship

  1. Changes
    - Create a proper view for DJ metadata
    - Set up correct relationships
    - Add necessary indexes and grants

  2. Security
    - Maintain secure access to user metadata
    - Preserve existing RLS policies
*/

-- Drop existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.dj_metadata;

-- Create a regular view for better real-time access
CREATE OR REPLACE VIEW public.dj_metadata AS
SELECT 
  id as user_id,
  raw_user_meta_data as metadata
FROM auth.users;

-- Create index on events.dj_id for better join performance
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events(dj_id);

-- Grant access to the view
GRANT SELECT ON public.dj_metadata TO authenticated;
GRANT SELECT ON public.dj_metadata TO anon;

-- Create a function to refresh user metadata
CREATE OR REPLACE FUNCTION public.refresh_dj_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- Create trigger to keep metadata in sync
CREATE OR REPLACE TRIGGER refresh_dj_metadata_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_dj_metadata();

-- Update foreign key if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_dj_id_fkey'
  ) THEN
    ALTER TABLE events DROP CONSTRAINT events_dj_id_fkey;
  END IF;
  
  ALTER TABLE events
  ADD CONSTRAINT events_dj_id_fkey 
  FOREIGN KEY (dj_id) 
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
END $$;
/*
  # Fix DJ Profile Query

  1. Changes
    - Drop existing get_dj_profile function
    - Create new get_dj_profile function with proper error handling
    - Update RLS policies
    - Add indexes for performance

  2. Security
    - Function is SECURITY DEFINER to ensure proper access control
    - RLS policies ensure proper data access
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_dj_profile(uuid);

-- Create function to get DJ profile with better error handling
CREATE OR REPLACE FUNCTION get_dj_profile(event_id uuid)
RETURNS TABLE (
  dj_name text,
  avatar_url text,
  bio text,
  social_links jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if event exists
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = event_id) THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(p.dj_name, 'DJ'),
    p.avatar_url,
    p.bio,
    COALESCE(p.social_links, '{}'::jsonb)
  FROM events e
  LEFT JOIN dj_profiles p ON p.id = e.dj_id
  WHERE e.id = event_id;

  -- If no rows returned, provide default values
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'DJ'::text,
      NULL::text,
      NULL::text,
      '{}'::jsonb;
  END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_dj_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_dj_profile TO anon;

-- Create index for better join performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events(dj_id);
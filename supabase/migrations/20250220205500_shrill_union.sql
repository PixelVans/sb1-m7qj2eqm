/*
  # Fix DJ Profiles Join

  1. Changes
    - Drop existing function
    - Create new function with proper signature
    - Update RLS policies
    - Fix join queries

  2. Benefits
    - Proper data relationships
    - Better query performance
    - Fixed attendee view
*/

-- First drop the existing function
DROP FUNCTION IF EXISTS get_dj_profile(uuid);

-- Create function to get DJ profile
CREATE OR REPLACE FUNCTION get_dj_profile(event_id uuid)
RETURNS TABLE (
  dj_name text,
  avatar_url text,
  bio text,
  social_links jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.dj_name,
    p.avatar_url,
    p.bio,
    p.social_links
  FROM events e
  JOIN dj_profiles p ON p.id = e.dj_id
  WHERE e.id = event_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_dj_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_dj_profile TO anon;

-- Update RLS policies for dj_profiles if needed
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON dj_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON dj_profiles
  FOR SELECT
  USING (true);

-- Create index for better join performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events(dj_id);
/*
  # Update DJ Profile Function and Indexes

  1. Changes
    - Add dj_id column to events table if missing
    - Create index for better join performance
    - Update RLS policies for dj_profiles
    - Create improved get_dj_profile function with better error handling

  2. Security
    - Maintain existing RLS policies
    - Add proper security definer to function
    - Set explicit search path for security
*/

-- Add dj_id column to events if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'dj_id'
  ) THEN
    ALTER TABLE events ADD COLUMN dj_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events(dj_id);

-- Update RLS policies for dj_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON dj_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON dj_profiles
  FOR SELECT
  USING (true);

-- First drop the existing function
DROP FUNCTION IF EXISTS get_dj_profile(uuid);

-- Create improved function to get DJ profile
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
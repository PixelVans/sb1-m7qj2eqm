/*
  # Fix DJ Metadata Access

  1. Changes
    - Create a new table `dj_profiles` to store DJ metadata separately
    - Add triggers to sync data between auth.users and dj_profiles
    - Update RLS policies for secure access

  2. Benefits
    - More reliable DJ metadata access
    - Better performance with dedicated table
    - Cleaner data structure
*/

-- Create dj_profiles table
CREATE TABLE IF NOT EXISTS public.dj_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dj_name text NOT NULL,
  avatar_url text,
  bio text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dj_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON dj_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON dj_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create function to sync metadata
CREATE OR REPLACE FUNCTION sync_dj_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update dj_profile
  INSERT INTO public.dj_profiles (
    id,
    dj_name,
    avatar_url,
    bio,
    social_links
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'dj_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'bio',
    COALESCE((NEW.raw_user_meta_data->>'social_links')::jsonb, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    dj_name = EXCLUDED.dj_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    social_links = EXCLUDED.social_links,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create trigger to sync metadata
DROP TRIGGER IF EXISTS sync_dj_profile_trigger ON auth.users;
CREATE TRIGGER sync_dj_profile_trigger
  AFTER INSERT OR UPDATE OF raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_dj_profile();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dj_profiles_dj_name ON dj_profiles(dj_name);
CREATE INDEX IF NOT EXISTS idx_dj_profiles_updated_at ON dj_profiles(updated_at);

-- Migrate existing data
INSERT INTO public.dj_profiles (
  id,
  dj_name,
  avatar_url,
  bio,
  social_links
)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'dj_name', 'DJ'),
  raw_user_meta_data->>'avatar_url',
  raw_user_meta_data->>'bio',
  COALESCE((raw_user_meta_data->>'social_links')::jsonb, '{}'::jsonb)
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
  dj_name = EXCLUDED.dj_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  social_links = EXCLUDED.social_links,
  updated_at = now();
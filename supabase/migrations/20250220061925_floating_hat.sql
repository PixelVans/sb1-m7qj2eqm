/*
  # Add rejected column to song_requests table

  1. Changes
    - Add `rejected` column to `song_requests` table with default value of false
    - Add index on `rejected` column for better query performance

  2. Notes
    - The column is nullable to maintain backward compatibility
    - Default value is false to match existing behavior
*/

-- Add rejected column if it doesn't exist
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS rejected boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_song_requests_rejected 
ON song_requests (rejected);
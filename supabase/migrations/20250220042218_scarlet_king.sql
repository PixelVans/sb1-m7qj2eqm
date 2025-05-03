/*
  # Add song link column to song_requests table

  1. Changes
    - Add `song_link` column to `song_requests` table
    - Make it optional (nullable)
    - Add text type to store URLs of any length
*/

-- Add song_link column
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS song_link text;
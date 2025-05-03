/*
  # Add pre-request functionality

  1. Changes
    - Add `is_pre_request` boolean column to `song_requests` table
    - Set default value to false for backward compatibility
    - Add index for better query performance
    - Update RLS policies to handle pre-requests

  2. Notes
    - Existing requests will be marked as live requests (is_pre_request = false)
    - New requests will need to specify whether they are pre-requests
    - RLS policies updated to allow pre-requests regardless of event status
*/

-- Add is_pre_request column with default value
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS is_pre_request boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_song_requests_is_pre_request 
ON song_requests (is_pre_request);

-- Update the RLS policies to handle pre-requests
DROP POLICY IF EXISTS "Anyone can view song requests for active events" ON song_requests;
CREATE POLICY "Anyone can view song requests for active events"
  ON song_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = song_requests.event_id 
      AND (events.active = true OR song_requests.is_pre_request = true)
    )
  );

DROP POLICY IF EXISTS "Anyone can create song requests for active events" ON song_requests;
CREATE POLICY "Anyone can create song requests for active events"
  ON song_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = song_requests.event_id 
      AND (events.active = true OR is_pre_request = true)
    )
  );

DROP POLICY IF EXISTS "Anyone can vote on song requests for active events" ON song_requests;
CREATE POLICY "Anyone can vote on song requests for active events"
  ON song_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = song_requests.event_id 
      AND (events.active = true OR song_requests.is_pre_request = true)
    )
  );
/*
  # Add updated_at column to events table

  1. Changes
    - Add updated_at column to events table
    - Add trigger to automatically update the timestamp
    - Add index for better query performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add updated_at column if it doesn't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update timestamp
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_updated_at ON events(updated_at);
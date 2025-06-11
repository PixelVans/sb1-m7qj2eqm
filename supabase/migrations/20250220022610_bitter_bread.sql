/*
  # Initial Schema Setup for WheresMySong

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `dj_id` (uuid, references auth.users)
      - `name` (text)
      - `active` (boolean)
    
    - `song_requests`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `event_id` (uuid, references events)
      - `title` (text)
      - `artist` (text)
      - `votes` (integer)
      - `played` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for DJs to manage their events
    - Add policies for attendees to view events and submit/vote on requests
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  dj_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  active boolean DEFAULT true
);

-- Create song_requests table
CREATE TABLE IF NOT EXISTS song_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_id uuid REFERENCES events NOT NULL,
  title text NOT NULL,
  artist text NOT NULL,
  votes integer DEFAULT 0,
  played boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "DJs can view their own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = dj_id);

CREATE POLICY "DJs can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = dj_id);

CREATE POLICY "DJs can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = dj_id);

-- Policies for song_requests
CREATE POLICY "Anyone can view song requests for active events"
  ON song_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = song_requests.event_id 
      AND events.active = true
    )
  );

CREATE POLICY "Anyone can create song requests for active events"
  ON song_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = song_requests.event_id 
      AND events.active = true
    )
  );

CREATE POLICY "Anyone can vote on song requests for active events"
  ON song_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = song_requests.event_id 
      AND events.active = true
    )
  );
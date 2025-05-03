/*
  # Improve event limit handling

  1. Changes
    - Add function to check event count before insert
    - Add custom error message for better frontend handling
    - Add index for faster event counting
*/

-- Add index for faster event counting
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON events (dj_id);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_event_limit_trigger ON events;
DROP FUNCTION IF EXISTS public.check_event_limit;

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.check_event_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan text;
  events_count integer;
BEGIN
  -- Get user's subscription plan with fallback to free
  SELECT COALESCE(NULLIF(raw_user_meta_data->>'subscription_plan', ''), 'free')
  INTO user_plan
  FROM auth.users
  WHERE id = NEW.dj_id;

  -- Count user's existing events
  SELECT COUNT(*)
  INTO events_count
  FROM events
  WHERE dj_id = NEW.dj_id;

  -- Check limits based on plan
  IF user_plan = 'free' AND events_count >= 1 THEN
    RAISE EXCEPTION 'EVENT_LIMIT_REACHED: Free plan users can only create 1 event. Please upgrade to create more events.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check event limit before insert
CREATE TRIGGER check_event_limit_trigger
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION check_event_limit();
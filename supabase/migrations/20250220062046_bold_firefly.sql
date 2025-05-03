/*
  # Add subscription features

  1. Changes
    - Add subscription_plan column to auth.users metadata
    - Add events_created column to auth.users metadata
    - Add function to check user's subscription limits
*/

-- Create a function to check if a user has reached their event limit
CREATE OR REPLACE FUNCTION public.check_event_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan text;
  events_count integer;
BEGIN
  -- Get user's subscription plan
  SELECT COALESCE((raw_user_meta_data->>'subscription_plan'), 'free')
  INTO user_plan
  FROM auth.users
  WHERE id = NEW.dj_id;

  -- Count user's events
  SELECT COUNT(*)
  INTO events_count
  FROM events
  WHERE dj_id = NEW.dj_id;

  -- Check limits based on plan
  IF user_plan = 'free' AND events_count >= 1 THEN
    RAISE EXCEPTION 'Free plan users can only create 1 event. Please upgrade to create more events.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check event limit before insert
DROP TRIGGER IF EXISTS check_event_limit_trigger ON events;
CREATE TRIGGER check_event_limit_trigger
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION check_event_limit();
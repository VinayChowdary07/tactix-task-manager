-- Remove Google Calendar related columns from tasks table
ALTER TABLE public.tasks 
DROP COLUMN IF EXISTS google_calendar_event_id,
DROP COLUMN IF EXISTS google_calendar_sync;

-- Add google_calendar_event_id column to tasks table for storing synced event IDs
ALTER TABLE public.tasks 
ADD COLUMN google_calendar_event_id TEXT;

-- Add google_calendar_sync column to track if user wants to sync this task
ALTER TABLE public.tasks 
ADD COLUMN google_calendar_sync BOOLEAN DEFAULT true;

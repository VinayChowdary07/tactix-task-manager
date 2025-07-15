
-- Add priority column to projects table
ALTER TABLE public.projects 
ADD COLUMN priority text DEFAULT 'Medium';

-- Add a check constraint to ensure only valid priority values
ALTER TABLE public.projects 
ADD CONSTRAINT projects_priority_check 
CHECK (priority IN ('Low', 'Medium', 'High'));

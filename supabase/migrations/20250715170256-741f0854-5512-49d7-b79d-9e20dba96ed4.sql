
-- Add new columns to tasks table for advanced features
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subtasks jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;

-- Update existing tasks to have the completed field based on status
UPDATE public.tasks 
SET completed = (status = 'Done') 
WHERE completed IS NULL;

-- Create index for better performance on recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON public.tasks (recurring) WHERE recurring = true;

-- Create index for better performance on completed tasks
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks (completed);

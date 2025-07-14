
-- Add recurring task fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'custom')),
ADD COLUMN repeat_interval INTEGER DEFAULT 1,
ADD COLUMN repeat_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN time_estimate INTEGER, -- in minutes
ADD COLUMN time_spent INTEGER DEFAULT 0, -- in minutes
ADD COLUMN is_recurring_parent BOOLEAN DEFAULT false,
ADD COLUMN parent_recurring_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create task_time_logs table for detailed time tracking
CREATE TABLE public.task_time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- calculated field
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on task_time_logs
ALTER TABLE public.task_time_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_time_logs
CREATE POLICY "Users can view their own time logs" 
  ON public.task_time_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time logs" 
  ON public.task_time_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time logs" 
  ON public.task_time_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time logs" 
  ON public.task_time_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at on task_time_logs
CREATE TRIGGER update_task_time_logs_updated_at 
  BEFORE UPDATE ON public.task_time_logs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create recurring task instances
CREATE OR REPLACE FUNCTION create_recurring_task_instance(task_id UUID)
RETURNS UUID AS $$
DECLARE
  original_task RECORD;
  new_due_date TIMESTAMP WITH TIME ZONE;
  new_task_id UUID;
BEGIN
  -- Get the original task
  SELECT * INTO original_task FROM tasks WHERE id = task_id;
  
  IF NOT FOUND OR original_task.repeat_type = 'none' THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next due date based on repeat type
  CASE original_task.repeat_type
    WHEN 'daily' THEN
      new_due_date := original_task.due_date + (original_task.repeat_interval || ' days')::INTERVAL;
    WHEN 'weekly' THEN
      new_due_date := original_task.due_date + (original_task.repeat_interval || ' weeks')::INTERVAL;
    WHEN 'monthly' THEN
      new_due_date := original_task.due_date + (original_task.repeat_interval || ' months')::INTERVAL;
    ELSE
      new_due_date := original_task.due_date + (original_task.repeat_interval || ' days')::INTERVAL;
  END CASE;
  
  -- Check if we should stop creating instances
  IF original_task.repeat_until IS NOT NULL AND new_due_date > original_task.repeat_until THEN
    RETURN NULL;
  END IF;
  
  -- Create new task instance
  INSERT INTO tasks (
    user_id, title, description, due_date, reminder_time, priority, 
    status, project_id, repeat_type, repeat_interval, repeat_until, 
    time_estimate, parent_recurring_task_id, is_recurring_parent
  ) VALUES (
    original_task.user_id, original_task.title, original_task.description, 
    new_due_date, 
    CASE WHEN original_task.reminder_time IS NOT NULL 
         THEN new_due_date - (original_task.due_date - original_task.reminder_time)
         ELSE NULL 
    END,
    original_task.priority, 'Todo', original_task.project_id,
    original_task.repeat_type, original_task.repeat_interval, original_task.repeat_until,
    original_task.time_estimate, 
    COALESCE(original_task.parent_recurring_task_id, original_task.id),
    false
  ) RETURNING id INTO new_task_id;
  
  RETURN new_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle task completion and recurring task creation
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If task is being marked as completed and has recurrence
  IF NEW.status = 'Done' AND OLD.status != 'Done' AND NEW.repeat_type != 'none' THEN
    -- Create next instance
    PERFORM create_recurring_task_instance(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task completion
CREATE TRIGGER task_completion_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_completion();

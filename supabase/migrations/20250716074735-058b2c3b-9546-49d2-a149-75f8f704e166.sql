
-- Remove the existing trigger that creates tasks on completion
DROP TRIGGER IF EXISTS task_completion_trigger ON tasks;

-- Update the create_recurring_task_instance function to be more robust
CREATE OR REPLACE FUNCTION public.create_recurring_task_instance(task_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  original_task RECORD;
  new_due_date TIMESTAMP WITH TIME ZONE;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_task_id UUID;
BEGIN
  -- Get the original task
  SELECT * INTO original_task FROM tasks WHERE id = task_id AND recurring = true;
  
  IF NOT FOUND OR original_task.repeat_type = 'none' OR original_task.repeat_type IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next due date based on repeat type
  CASE original_task.repeat_type
    WHEN 'daily' THEN
      new_due_date := original_task.due_date + (COALESCE(original_task.repeat_interval, 1) || ' days')::INTERVAL;
    WHEN 'weekly' THEN
      new_due_date := original_task.due_date + (COALESCE(original_task.repeat_interval, 1) || ' weeks')::INTERVAL;
    WHEN 'monthly' THEN
      new_due_date := original_task.due_date + (COALESCE(original_task.repeat_interval, 1) || ' months')::INTERVAL;
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Calculate new start date if original has one
  IF original_task.start_date IS NOT NULL THEN
    new_start_date := original_task.start_date + (new_due_date - original_task.due_date);
  ELSE
    new_start_date := NULL;
  END IF;
  
  -- Check if we should stop creating instances
  IF original_task.repeat_until IS NOT NULL AND new_due_date > original_task.repeat_until THEN
    RETURN NULL;
  END IF;
  
  -- Create new task instance
  INSERT INTO tasks (
    user_id, title, description, due_date, start_date, priority, 
    status, project_id, recurring, repeat_type, repeat_interval, repeat_until, 
    time_estimate, parent_recurring_task_id, is_recurring_parent,
    subtasks, color
  ) VALUES (
    original_task.user_id, 
    original_task.title, 
    original_task.description, 
    new_due_date,
    new_start_date,
    original_task.priority, 
    'Todo', 
    original_task.project_id,
    original_task.recurring,
    original_task.repeat_type, 
    original_task.repeat_interval, 
    original_task.repeat_until,
    original_task.time_estimate, 
    COALESCE(original_task.parent_recurring_task_id, original_task.id),
    false,
    original_task.subtasks,
    original_task.color
  ) RETURNING id INTO new_task_id;
  
  RETURN new_task_id;
END;
$function$;

-- Create a function to process all recurring tasks
CREATE OR REPLACE FUNCTION public.process_recurring_tasks()
 RETURNS TABLE(processed_count integer, created_tasks uuid[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  task_record RECORD;
  new_task_id UUID;
  created_ids UUID[] := '{}';
  count_processed INTEGER := 0;
  current_date_only DATE := CURRENT_DATE;
BEGIN
  -- Find all recurring tasks that need new instances created
  FOR task_record IN 
    SELECT DISTINCT ON (COALESCE(parent_recurring_task_id, id)) *
    FROM tasks 
    WHERE recurring = true 
      AND repeat_type IN ('daily', 'weekly', 'monthly')
      AND due_date IS NOT NULL
      AND (repeat_until IS NULL OR repeat_until >= current_date_only)
      AND (
        -- Daily tasks: check if due date + interval <= current date
        (repeat_type = 'daily' AND due_date::date + (COALESCE(repeat_interval, 1) || ' days')::INTERVAL <= current_date_only) OR
        -- Weekly tasks: check if due date + interval <= current date  
        (repeat_type = 'weekly' AND due_date::date + (COALESCE(repeat_interval, 1) || ' weeks')::INTERVAL <= current_date_only) OR
        -- Monthly tasks: check if due date + interval <= current date
        (repeat_type = 'monthly' AND due_date::date + (COALESCE(repeat_interval, 1) || ' months')::INTERVAL <= current_date_only)
      )
    ORDER BY COALESCE(parent_recurring_task_id, id), due_date DESC
  LOOP
    -- Check if a task already exists for the next occurrence
    DECLARE
      next_due_date TIMESTAMP WITH TIME ZONE;
      existing_task_count INTEGER;
    BEGIN
      -- Calculate what the next due date should be
      CASE task_record.repeat_type
        WHEN 'daily' THEN
          next_due_date := task_record.due_date + (COALESCE(task_record.repeat_interval, 1) || ' days')::INTERVAL;
        WHEN 'weekly' THEN
          next_due_date := task_record.due_date + (COALESCE(task_record.repeat_interval, 1) || ' weeks')::INTERVAL;
        WHEN 'monthly' THEN
          next_due_date := task_record.due_date + (COALESCE(task_record.repeat_interval, 1) || ' months')::INTERVAL;
      END CASE;
      
      -- Check if task already exists for this date
      SELECT COUNT(*) INTO existing_task_count
      FROM tasks 
      WHERE COALESCE(parent_recurring_task_id, id) = COALESCE(task_record.parent_recurring_task_id, task_record.id)
        AND due_date::date = next_due_date::date;
      
      -- Only create if no task exists for this date
      IF existing_task_count = 0 THEN
        new_task_id := create_recurring_task_instance(task_record.id);
        IF new_task_id IS NOT NULL THEN
          created_ids := array_append(created_ids, new_task_id);
          count_processed := count_processed + 1;
        END IF;
      END IF;
    END;
  END LOOP;
  
  RETURN QUERY SELECT count_processed, created_ids;
END;
$function$;

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the recurring task processor to run daily at midnight
SELECT cron.schedule(
  'process-recurring-tasks',
  '0 0 * * *', -- Every day at midnight
  $$
  SELECT process_recurring_tasks();
  $$
);

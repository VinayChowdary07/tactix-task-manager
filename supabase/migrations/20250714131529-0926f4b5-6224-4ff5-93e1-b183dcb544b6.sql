
-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create many-to-many relationship table for task tags
CREATE TABLE public.task_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, tag_id)
);

-- Add Row Level Security (RLS) for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
CREATE POLICY "Users can view their own tags" 
  ON public.tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" 
  ON public.tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" 
  ON public.tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" 
  ON public.tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for task_tags
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for task_tags (users can only manage tags for their own tasks)
CREATE POLICY "Users can view task tags for their own tasks" 
  ON public.task_tags 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create task tags for their own tasks" 
  ON public.task_tags 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete task tags for their own tasks" 
  ON public.task_tags 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Add trigger for tags updated_at
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add a priority field to tasks if it doesn't exist (it should already exist based on current schema)
-- The priority field already exists with values 'Low', 'Medium', 'High'
-- Let's add 'Critical' as an option by updating the check constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check 
  CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));

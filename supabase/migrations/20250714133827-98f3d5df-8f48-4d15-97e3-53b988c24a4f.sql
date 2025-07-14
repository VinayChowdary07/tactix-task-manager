
-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create many-to-many relationship table for goal tasks
CREATE TABLE public.goal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, task_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add reminder_time field to tasks table
ALTER TABLE public.tasks ADD COLUMN reminder_time TIMESTAMP WITH TIME ZONE;

-- Add Row Level Security (RLS) for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create policies for goals
CREATE POLICY "Users can view their own goals" 
  ON public.goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
  ON public.goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
  ON public.goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for goal_tasks
ALTER TABLE public.goal_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for goal_tasks
CREATE POLICY "Users can view goal tasks for their own goals" 
  ON public.goal_tasks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_tasks.goal_id 
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create goal tasks for their own goals" 
  ON public.goal_tasks 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_tasks.goal_id 
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete goal tasks for their own goals" 
  ON public.goal_tasks 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_tasks.goal_id 
    AND goals.user_id = auth.uid()
  ));

-- Add Row Level Security (RLS) for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

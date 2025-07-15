
-- Add new columns to the goals table for enhanced functionality
ALTER TABLE public.goals 
ADD COLUMN start_date timestamp with time zone,
ADD COLUMN goal_type text DEFAULT 'personal',
ADD COLUMN tags text[],
ADD COLUMN color text DEFAULT '#6366f1',
ADD COLUMN notes text,
ADD COLUMN status text DEFAULT 'active',
ADD COLUMN completed_at timestamp with time zone;

-- Create milestones table
CREATE TABLE public.goal_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for goal_milestones
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for goal_milestones
CREATE POLICY "Users can view milestones for their own goals" 
  ON public.goal_milestones 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_milestones.goal_id 
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create milestones for their own goals" 
  ON public.goal_milestones 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_milestones.goal_id 
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones for their own goals" 
  ON public.goal_milestones 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_milestones.goal_id 
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete milestones for their own goals" 
  ON public.goal_milestones 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = goal_milestones.goal_id 
    AND goals.user_id = auth.uid()
  ));

-- Add constraints for goal_type and status
ALTER TABLE public.goals 
ADD CONSTRAINT goals_type_check 
CHECK (goal_type IN ('personal', 'team', 'recurring'));

ALTER TABLE public.goals 
ADD CONSTRAINT goals_status_check 
CHECK (status IN ('active', 'completed', 'paused', 'archived'));

-- Add trigger for milestones updated_at
CREATE TRIGGER update_goal_milestones_updated_at BEFORE UPDATE ON public.goal_milestones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

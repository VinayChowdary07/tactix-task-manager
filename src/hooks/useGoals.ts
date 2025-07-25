
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  target_date?: string;
  goal_type: 'personal' | 'team' | 'recurring';
  tags?: string[];
  color: string;
  notes?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  completed_at?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  goal_tasks?: Array<{
    id: string;
    task_id: string;
    tasks: {
      id: string;
      title: string;
      status: string;
    };
  }>;
  goal_milestones?: Array<{
    id: string;
    title: string;
    description?: string;
    target_date?: string;
    completed: boolean;
    completed_at?: string;
  }>;
}

export interface GoalInput {
  title: string;
  description?: string;
  start_date?: string;
  target_date?: string;
  goal_type?: 'personal' | 'team' | 'recurring';
  tags?: string[];
  color?: string;
  notes?: string;
  status?: 'active' | 'completed' | 'paused' | 'archived';
  taskIds?: string[];
  milestones?: Array<{
    title: string;
    description?: string;
    target_date?: string;
  }>;
}

export const useGoals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          goal_tasks (
            id,
            task_id,
            tasks (
              id,
              title,
              status
            )
          ),
          goal_milestones (
            id,
            title,
            description,
            target_date,
            completed,
            completed_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async ({ taskIds, milestones, ...goalData }: GoalInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert([{ ...goalData, user_id: user.id }])
        .select()
        .single();
      
      if (goalError) throw goalError;
      
      // Link tasks if provided
      if (taskIds && taskIds.length > 0) {
        const taskLinks = taskIds.map(taskId => ({
          goal_id: goal.id,
          task_id: taskId
        }));
        
        const { error: linkError } = await supabase
          .from('goal_tasks')
          .insert(taskLinks);
        
        if (linkError) throw linkError;
      }

      // Create milestones if provided
      if (milestones && milestones.length > 0) {
        const milestoneData = milestones.map(milestone => ({
          goal_id: goal.id,
          ...milestone
        }));
        
        const { error: milestoneError } = await supabase
          .from('goal_milestones')
          .insert(milestoneData);
        
        if (milestoneError) throw milestoneError;
      }
      
      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully!');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, taskIds, milestones, ...goalData }: Partial<Goal> & { id: string; taskIds?: string[]; milestones?: Array<{id?: string; title: string; description?: string; target_date?: string; completed?: boolean}> }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update task links if provided
      if (taskIds !== undefined) {
        await supabase.from('goal_tasks').delete().eq('goal_id', id);
        
        if (taskIds.length > 0) {
          const taskLinks = taskIds.map(taskId => ({
            goal_id: id,
            task_id: taskId
          }));
          
          const { error: linkError } = await supabase
            .from('goal_tasks')
            .insert(taskLinks);
          
          if (linkError) throw linkError;
        }
      }

      // Update milestones if provided
      if (milestones !== undefined) {
        // Delete existing milestones and recreate
        await supabase.from('goal_milestones').delete().eq('goal_id', id);
        
        if (milestones.length > 0) {
          const milestoneData = milestones.map(milestone => ({
            goal_id: id,
            title: milestone.title,
            description: milestone.description,
            target_date: milestone.target_date,
            completed: milestone.completed || false
          }));
          
          const { error: milestoneError } = await supabase
            .from('goal_milestones')
            .insert(milestoneData);
          
          if (milestoneError) throw milestoneError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    },
  });

  const markGoalComplete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal marked as complete! 🎉');
    },
    onError: (error) => {
      console.error('Error marking goal as complete:', error);
      toast.error('Failed to mark goal as complete');
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    markGoalComplete,
  };
};

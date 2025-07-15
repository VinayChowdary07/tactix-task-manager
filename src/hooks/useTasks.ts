
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_interval?: number;
  repeat_until?: string;
  time_estimate?: number;
  time_spent?: number;
  is_recurring_parent?: boolean;
  parent_recurring_task_id?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_interval?: number;
  repeat_until?: string;
  time_estimate?: number;
}

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching tasks for user:', user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Tasks fetched successfully:', data?.length || 0);
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: TaskInput) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating task with data:', taskData);
      
      // Clean and prepare the data for insertion
      const insertData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        reminder_time: taskData.reminder_time || null,
        priority: taskData.priority,
        status: taskData.status,
        project_id: taskData.project_id || null,
        repeat_type: taskData.repeat_type || 'none',
        repeat_interval: taskData.repeat_interval || null,
        repeat_until: taskData.repeat_until || null,
        time_estimate: taskData.time_estimate || null,
        user_id: user.id
      };

      console.log('Inserting task data:', insertData);

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();
      
      if (taskError) {
        console.error('Error creating task:', taskError);
        throw taskError;
      }

      console.log('Task created successfully:', taskResult);
      return taskResult as Task;
    },
    onSuccess: (data) => {
      console.log('Task creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error) => {
      console.error('Task creation failed:', error);
      toast.error('Failed to create task. Please try again.');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...taskData }: Partial<Task> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating task with ID:', id, 'Data:', taskData);
      
      // Clean and prepare the data for update
      const updateData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        reminder_time: taskData.reminder_time || null,
        priority: taskData.priority,
        status: taskData.status,
        project_id: taskData.project_id || null,
        repeat_type: taskData.repeat_type || 'none',
        repeat_interval: taskData.repeat_interval || null,
        repeat_until: taskData.repeat_until || null,
        time_estimate: taskData.time_estimate || null,
        time_spent: taskData.time_spent || null
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('Updating task with cleaned data:', updateData);

      const { data: taskResult, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Task updated successfully:', taskResult);
      return taskResult as Task;
    },
    onSuccess: (data) => {
      console.log('Task update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error) => {
      console.error('Task update failed:', error);
      toast.error('Failed to update task. Please try again.');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting task with ID:', id);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
      
      console.log('Task deleted successfully');
    },
    onSuccess: () => {
      console.log('Task deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      console.error('Task deletion failed:', error);
      toast.error('Failed to delete task. Please try again.');
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
};

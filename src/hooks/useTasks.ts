
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  time_estimate?: number; // in minutes
  time_spent?: number; // in minutes
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  time_estimate?: number;
}

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: TaskInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const insertData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        priority: taskData.priority,
        status: taskData.status,
        project_id: taskData.project_id || null,
        time_estimate: taskData.time_estimate || null,
        user_id: user.id
      };

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();
      
      if (taskError) {
        console.error('Error creating task:', taskError);
        throw taskError;
      }

      return taskResult as Task;
    },
    onSuccess: () => {
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
      
      const updateData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        priority: taskData.priority,
        status: taskData.status,
        project_id: taskData.project_id || null,
        time_estimate: taskData.time_estimate || null
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

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

      return taskResult as Task;
    },
    onSuccess: () => {
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
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    },
    onSuccess: () => {
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

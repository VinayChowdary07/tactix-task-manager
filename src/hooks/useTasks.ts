
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  start_date?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  time_estimate?: number; // in minutes
  time_spent?: number; // in minutes
  recurring?: boolean;
  repeat_type?: 'daily' | 'weekly' | 'monthly' | 'none';
  repeat_interval?: number;
  repeat_until?: string;
  subtasks?: Subtask[];
  completed?: boolean;
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string;
  start_date?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  time_estimate?: number;
  recurring?: boolean;
  repeat_type?: 'daily' | 'weekly' | 'monthly' | 'none';
  repeat_interval?: number;
  repeat_until?: string;
  subtasks?: Subtask[];
  completed?: boolean;
}

// Helper function to convert database task to our Task interface
const convertDbTaskToTask = (dbTask: any): Task => {
  return {
    ...dbTask,
    subtasks: Array.isArray(dbTask.subtasks) ? dbTask.subtasks as Subtask[] : []
  };
};

// Helper function to convert our Task interface to database format
const convertTaskToDbFormat = (task: any) => {
  return {
    ...task,
    subtasks: JSON.stringify(task.subtasks || [])
  };
};

export const useTasks = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for tasks query');
        return [];
      }
      
      console.log('Fetching tasks for user:', user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Tasks fetched successfully:', data?.length);
      return data ? data.map(convertDbTaskToTask) : [];
    },
    enabled: !!user?.id && !authLoading,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: TaskInput) => {
      if (!user?.id) {
        throw new Error('User not authenticated. Please sign in to create tasks.');
      }
      
      console.log('Creating task for user:', user.id);
      
      const insertData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        start_date: taskData.start_date || null,
        priority: taskData.priority,
        status: taskData.status,
        project_id: taskData.project_id || null,
        time_estimate: taskData.time_estimate || null,
        recurring: taskData.recurring || false,
        repeat_type: taskData.repeat_type || 'none',
        repeat_interval: taskData.repeat_interval || 1,
        repeat_until: taskData.repeat_until || null,
        subtasks: taskData.subtasks || [],
        completed: taskData.completed || false,
        user_id: user.id
      };

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert([convertTaskToDbFormat(insertData)])
        .select()
        .single();
      
      if (taskError) {
        console.error('Error creating task:', taskError);
        throw taskError;
      }

      console.log('Task created successfully:', taskResult.id);
      return convertDbTaskToTask(taskResult);
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
      if (!user?.id) {
        throw new Error('User not authenticated. Please sign in to update tasks.');
      }
      
      console.log('Updating task:', id);
      
      const updateData = {
        title: taskData.title?.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        start_date: taskData.start_date || null,
        priority: taskData.priority,
        status: taskData.status,
        project_id: taskData.project_id || null,
        time_estimate: taskData.time_estimate || null,
        recurring: taskData.recurring,
        repeat_type: taskData.repeat_type,
        repeat_interval: taskData.repeat_interval,
        repeat_until: taskData.repeat_until || null,
        subtasks: taskData.subtasks || [],
        completed: taskData.completed
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const { data: taskResult, error } = await supabase
        .from('tasks')
        .update(convertTaskToDbFormat(updateData))
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Task updated successfully:', taskResult.id);
      return convertDbTaskToTask(taskResult);
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
      if (!user?.id) {
        throw new Error('User not authenticated. Please sign in to delete tasks.');
      }
      
      console.log('Deleting task:', id);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      console.log('Task deleted successfully:', id);
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
    isLoading: isLoading || authLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
};

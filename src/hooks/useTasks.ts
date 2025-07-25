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
  color?: string;
  parent_recurring_task_id?: string;
  is_recurring_parent?: boolean;
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
  color?: string;
}

// Helper function to convert database task to our Task interface
const convertDbTaskToTask = (dbTask: any): Task => {
  return {
    ...dbTask,
    subtasks: Array.isArray(dbTask.subtasks) ? dbTask.subtasks as Subtask[] : 
              (dbTask.subtasks ? JSON.parse(dbTask.subtasks) : [])
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
      
      console.log('Creating task for user:', user.id, 'with data:', taskData);
      
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
        color: taskData.color || null,
        user_id: user.id,
        is_recurring_parent: taskData.recurring || false
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
      
      console.log('Updating task:', id, 'with data:', taskData);
      
      // Only include defined values in the update to preserve existing data
      const updateData: Record<string, any> = {};
      
      // Only add fields that are explicitly being updated
      if (taskData.title !== undefined) updateData.title = taskData.title?.trim();
      if (taskData.description !== undefined) updateData.description = taskData.description?.trim() || null;
      if (taskData.due_date !== undefined) updateData.due_date = taskData.due_date || null;
      if (taskData.start_date !== undefined) updateData.start_date = taskData.start_date || null;
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      if (taskData.status !== undefined) updateData.status = taskData.status;
      if (taskData.project_id !== undefined) updateData.project_id = taskData.project_id || null;
      if (taskData.time_estimate !== undefined) updateData.time_estimate = taskData.time_estimate || null;
      if (taskData.recurring !== undefined) updateData.recurring = taskData.recurring;
      if (taskData.repeat_type !== undefined) updateData.repeat_type = taskData.repeat_type;
      if (taskData.repeat_interval !== undefined) updateData.repeat_interval = taskData.repeat_interval;
      if (taskData.repeat_until !== undefined) updateData.repeat_until = taskData.repeat_until || null;
      if (taskData.subtasks !== undefined) updateData.subtasks = taskData.subtasks || [];
      if (taskData.completed !== undefined) updateData.completed = taskData.completed;
      if (taskData.color !== undefined) updateData.color = taskData.color;

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

  // Function to manually trigger recurring task processing (for testing)
  const processRecurringTasks = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated.');
      }
      
      console.log('Manually processing recurring tasks...');
      
      const { data, error } = await supabase.rpc('process_recurring_tasks');
      
      if (error) {
        console.error('Error processing recurring tasks:', error);
        throw error;
      }
      
      console.log('Recurring tasks processed:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data && data.length > 0 && data[0].processed_count > 0) {
        toast.success(`Created ${data[0].processed_count} recurring task(s)!`);
      } else {
        toast.info('No recurring tasks needed to be created.');
      }
    },
    onError: (error) => {
      console.error('Manual recurring task processing failed:', error);
      toast.error('Failed to process recurring tasks.');
    },
  });

  return {
    tasks,
    isLoading: isLoading || authLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    processRecurringTasks,
  };
};

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
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  tagIds?: string[];
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
        .select(`
          *,
          task_tags (
            tag_id,
            tags (
              id,
              name,
              color
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to include tags directly on tasks
      const tasksWithTags = data.map(task => ({
        ...task,
        tags: task.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || []
      }));
      
      return tasksWithTags as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async ({ tagIds, ...taskData }: TaskInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();
      
      if (taskError) throw taskError;
      
      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          task_id: task.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('task_tags')
          .insert(tagInserts);
        
        if (tagError) throw tagError;
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, tagIds, ...taskData }: Partial<Task> & { id: string; tagIds?: string[] }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update tags if provided
      if (tagIds !== undefined) {
        // Remove existing tags
        await supabase
          .from('task_tags')
          .delete()
          .eq('task_id', id);
        
        // Add new tags
        if (tagIds.length > 0) {
          const tagInserts = tagIds.map(tagId => ({
            task_id: id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('task_tags')
            .insert(tagInserts);
          
          if (tagError) throw tagError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
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

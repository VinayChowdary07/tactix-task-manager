
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface TaskTag {
  id: string;
  task_id: string;
  tag_id: string;
  created_at: string;
}

export const useTaskTags = (taskId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: taskTags = [], isLoading } = useQuery({
    queryKey: ['task-tags', taskId],
    queryFn: async () => {
      if (!user || !taskId) return [];
      
      const { data, error } = await supabase
        .from('task_tags')
        .select(`
          *,
          tags (
            id,
            name,
            color
          )
        `)
        .eq('task_id', taskId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!taskId,
  });

  const addTagToTask = useMutation({
    mutationFn: async ({ taskId, tagId }: { taskId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('task_tags')
        .insert([{ task_id: taskId, tag_id: tagId }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const removeTagFromTask = useMutation({
    mutationFn: async ({ taskId, tagId }: { taskId: string; tagId: string }) => {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag_id', tagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    taskTags,
    isLoading,
    addTagToTask,
    removeTagFromTask,
  };
};

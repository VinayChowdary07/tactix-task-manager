
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TagInput {
  name: string;
  color?: string;
}

export const useTags = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!user,
  });

  const createTag = useMutation({
    mutationFn: async (tagData: TagInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tags')
        .insert([{ ...tagData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully!');
    },
    onError: (error) => {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tag deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    },
  });

  return {
    tags,
    isLoading,
    error,
    createTag,
    deleteTag,
  };
};

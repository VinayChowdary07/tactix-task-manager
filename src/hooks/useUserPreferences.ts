
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

type UserPreferences = Tables<'user_preferences'>;
type UserPreferencesInsert = TablesInsert<'user_preferences'>;
type UserPreferencesUpdate = TablesUpdate<'user_preferences'>;

export const useUserPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user_preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: UserPreferencesUpdate) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .update(preferencesData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    },
  });

  const updateSinglePreference = (key: keyof UserPreferencesUpdate, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    updateSinglePreference,
    isUpdating: updatePreferencesMutation.isPending,
  };
};

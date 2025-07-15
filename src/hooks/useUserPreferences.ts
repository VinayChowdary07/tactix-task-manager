
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
      
      console.log('Fetching preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
        throw error;
      }

      // If no preferences exist, create them automatically
      if (!data) {
        console.log('No preferences found, creating default ones...');
        const { data: newPreferences, error: createError } = await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id,
            task_reminders: true,
            team_updates: true,
            project_milestones: true,
            weekly_summary: true,
            mobile_push_notifications: true,
            email_notifications: true,
            theme: 'dark',
            accent_color: 'cyan',
            profile_visibility: true,
            task_sharing: true,
            activity_status: true,
            analytics_tracking: true,
            two_factor_enabled: false
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating preferences:', createError);
          throw createError;
        }

        console.log('Preferences created successfully:', newPreferences);
        return newPreferences;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: UserPreferencesUpdate) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Updating preferences with data:', preferencesData);

      const { data, error } = await supabase
        .from('user_preferences')
        .update(preferencesData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Preferences update error:', error);
        throw error;
      }

      console.log('Preferences updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    },
  });

  const updateSinglePreference = (key: keyof UserPreferencesUpdate, value: any) => {
    console.log(`Updating single preference: ${key} = ${value}`);
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

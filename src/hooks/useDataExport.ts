
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export const useDataExport = () => {
  const { user } = useAuth();

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch all user data
      const [tasksResult, projectsResult, goalsResult, profileResult, preferencesResult] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('user_id', user.id),
        supabase.from('user_preferences').select('*').eq('user_id', user.id),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (projectsResult.error) throw projectsResult.error;
      if (goalsResult.error) throw goalsResult.error;
      if (profileResult.error) throw profileResult.error;
      if (preferencesResult.error) throw preferencesResult.error;

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        tasks: tasksResult.data,
        projects: projectsResult.data,
        goals: goalsResult.data,
        profile: profileResult.data?.[0] || null,
        preferences: preferencesResult.data?.[0] || null,
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasknova-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return exportData;
    },
    onSuccess: () => {
      toast.success('Data exported successfully');
    },
    onError: (error) => {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    },
  });

  const deleteAllDataMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Delete user data in correct order (respecting foreign keys)
      await supabase.from('goal_tasks').delete().eq('goal_id', user.id);
      await supabase.from('task_time_logs').delete().eq('user_id', user.id);
      await supabase.from('tasks').delete().eq('user_id', user.id);
      await supabase.from('goals').delete().eq('user_id', user.id);
      await supabase.from('projects').delete().eq('user_id', user.id);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      await supabase.from('user_preferences').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);

      // Delete avatar from storage
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.gif`]);
    },
    onSuccess: () => {
      toast.success('All data deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data');
    },
  });

  return {
    exportData: exportDataMutation.mutate,
    deleteAllData: deleteAllDataMutation.mutate,
    isExporting: exportDataMutation.isPending,
    isDeleting: deleteAllDataMutation.isPending,
  };
};

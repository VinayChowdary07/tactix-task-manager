
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tasks?: Array<{
    id: string;
    status: string;
  }>;
  task_count?: number;
  completed_task_count?: number;
  progress?: number;
}

export interface ProjectInput {
  name: string;
  description?: string;
  color?: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch projects with task counts
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks:tasks(id, status)
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Calculate progress for each project
      const projectsWithProgress = data.map(project => {
        const tasks = project.tasks || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          ...project,
          task_count: totalTasks,
          completed_task_count: completedTasks,
          progress
        };
      });
      
      return projectsWithProgress as Project[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (projectData: ProjectInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...projectData }: Partial<Project> & { id: string }) => {
      // Remove non-database fields before updating
      const { tasks, task_count, completed_task_count, progress, ...updateData } = projectData;
      
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Project updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      // First, set all tasks with this project_id to null
      await supabase
        .from('tasks')
        .update({ project_id: null })
        .eq('project_id', id);
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Project deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
  };
};

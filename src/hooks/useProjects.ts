
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'active' | 'completed' | 'on_hold' | 'archived';
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
  team_members?: Array<{ id: string; name: string; avatar?: string }>;
}

export interface ProjectInput {
  name: string;
  description?: string;
  color?: string;
  priority?: 'Low' | 'Medium' | 'High';
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching projects for user:', user.id);
      
      // Fetch projects with task counts
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks:tasks(id, status)
        `)
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      console.log('Fetched projects:', data);
      
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
          progress,
          priority: project.priority || 'Medium' as 'Low' | 'Medium' | 'High',
          status: 'active' as 'active' | 'completed' | 'on_hold' | 'archived', // Default status since it's not in DB
          team_members: [] // Default empty array since it's not in DB yet
        };
      });
      
      return projectsWithProgress as Project[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (projectData: ProjectInput) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating project:', projectData);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          ...projectData, 
          user_id: user.id,
          priority: projectData.priority || 'Medium'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }
      
      console.log('Created project:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project "${data.name}" created successfully!`);
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...projectData }: Partial<Project> & { id: string }) => {
      console.log('Updating project:', id, projectData);
      
      // Remove non-database fields before updating
      const { tasks, task_count, completed_task_count, progress, ...updateData } = projectData;
      
      // Only include fields that should be updated
      const cleanUpdateData: any = {};
      if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
      if (updateData.description !== undefined) cleanUpdateData.description = updateData.description;
      if (updateData.color !== undefined) cleanUpdateData.color = updateData.color;
      if (updateData.priority !== undefined) cleanUpdateData.priority = updateData.priority;
      
      const { data, error } = await supabase
        .from('projects')
        .update(cleanUpdateData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }
      
      console.log('Updated project:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Project "${data.name}" updated successfully!`);
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project. Please try again.');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting project:', id);
      
      // First, set all tasks with this project_id to null
      await supabase
        .from('tasks')
        .update({ project_id: null })
        .eq('project_id', id);
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
      
      console.log('Deleted project:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Project deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
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

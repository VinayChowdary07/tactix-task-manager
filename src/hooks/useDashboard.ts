
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useTasks } from './useTasks';
import { useProjects } from './useProjects';
import { useGoals } from './useGoals';
import { subDays, startOfDay, endOfDay, format, startOfWeek, endOfWeek } from 'date-fns';

export interface DashboardStats {
  tasksToday: number;
  tasksCompleted: number;
  tasksPending: number;
  projectsActive: number;
  projectsCompleted: number;
  goalsInProgress: number;
  goalsAchieved: number;
  goalsAchievedThisWeek: number;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'goal';
  action: 'created' | 'completed' | 'updated';
  title: string;
  timestamp: string;
}

export interface ProductivityData {
  date: string;
  tasksCompleted: number;
  projectsCompleted: number;
}

export const useDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();

  // Calculate dashboard stats
  const stats: DashboardStats = {
    tasksToday: tasks.filter(task => {
      const today = new Date();
      const taskDate = task.due_date ? new Date(task.due_date) : null;
      return taskDate && 
        taskDate >= startOfDay(today) && 
        taskDate <= endOfDay(today);
    }).length,
    tasksCompleted: tasks.filter(task => task.status === 'Done').length,
    tasksPending: tasks.filter(task => task.status !== 'Done').length,
    projectsActive: projects.filter(project => project.progress < 100).length,
    projectsCompleted: projects.filter(project => project.progress === 100).length,
    goalsInProgress: goals.filter(goal => goal.status === 'active').length,
    goalsAchieved: goals.filter(goal => goal.status === 'completed').length,
    goalsAchievedThisWeek: goals.filter(goal => {
      if (goal.status !== 'completed' || !goal.completed_at) return false;
      const completedDate = new Date(goal.completed_at);
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      return completedDate >= weekStart && completedDate <= weekEnd;
    }).length,
  };

  // Get recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];
      
      const sevenDaysAgo = subDays(new Date(), 7);
      const activities: ActivityItem[] = [];

      // Recent tasks
      const recentTasks = tasks
        .filter(task => new Date(task.updated_at) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);

      recentTasks.forEach(task => {
        activities.push({
          id: task.id,
          type: 'task',
          action: task.status === 'Done' ? 'completed' : 'updated',
          title: task.title,
          timestamp: task.updated_at,
        });
      });

      // Recent projects
      const recentProjects = projects
        .filter(project => new Date(project.updated_at) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      recentProjects.forEach(project => {
        activities.push({
          id: project.id,
          type: 'project',
          action: project.progress === 100 ? 'completed' : 'updated',
          title: project.name,
          timestamp: project.updated_at,
        });
      });

      // Recent goals
      const recentGoals = goals
        .filter(goal => new Date(goal.updated_at) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      recentGoals.forEach(goal => {
        activities.push({
          id: goal.id,
          type: 'goal',
          action: goal.status === 'completed' ? 'completed' : 'updated',
          title: goal.title,
          timestamp: goal.updated_at,
        });
      });

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);
    },
    enabled: !!user,
  });

  // Get productivity data for charts
  const productivityData: ProductivityData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM dd');
    
    const tasksCompletedOnDate = tasks.filter(task => {
      if (task.status !== 'Done') return false;
      const completedDate = new Date(task.updated_at);
      return completedDate >= startOfDay(date) && completedDate <= endOfDay(date);
    }).length;

    const projectsCompletedOnDate = projects.filter(project => {
      if (project.progress !== 100) return false;
      const updatedDate = new Date(project.updated_at);
      return updatedDate >= startOfDay(date) && updatedDate <= endOfDay(date);
    }).length;

    productivityData.push({
      date: dateStr,
      tasksCompleted: tasksCompletedOnDate,
      projectsCompleted: projectsCompletedOnDate,
    });
  }

  // Get upcoming deadlines
  const upcomingDeadlines = tasks
    .filter(task => {
      if (!task.due_date || task.status === 'Done') return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 10);

  return {
    stats,
    recentActivity,
    productivityData,
    upcomingDeadlines,
    isLoading: false,
  };
};

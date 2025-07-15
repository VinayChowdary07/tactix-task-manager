import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { googleCalendarService } from '@/services/googleCalendar';

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
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_interval?: number;
  repeat_until?: string;
  time_estimate?: number;
  time_spent?: number;
  is_recurring_parent?: boolean;
  parent_recurring_task_id?: string;
  google_calendar_event_id?: string;
  google_calendar_sync?: boolean;
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Done';
  project_id?: string;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_interval?: number;
  repeat_until?: string;
  time_estimate?: number;
  google_calendar_sync?: boolean;
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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const syncToGoogleCalendar = async (task: Task): Promise<string | null> => {
    if (!task.google_calendar_sync || !task.due_date) {
      console.log('⏭️ Skipping calendar sync - sync disabled or no due date');
      return null;
    }

    try {
      console.log('🔄 Starting Google Calendar sync for task:', task.title);
      const event = googleCalendarService.createEventFromTask(task);
      const eventId = await googleCalendarService.createEvent(event);
      
      if (eventId) {
        toast.success('Task synced to Google Calendar successfully!');
      }
      
      return eventId;
    } catch (error) {
      console.error('❌ Failed to sync to Google Calendar:', error);
      
      // Show user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('access')) {
          toast.error('Google Calendar access expired. Please sign out and sign in with Google again.');
        } else if (error.message.includes('denied') || error.message.includes('permissions')) {
          toast.error('Google Calendar access denied. Please check your permissions.');
        } else if (error.message.includes('Invalid')) {
          toast.error('Invalid task data for calendar sync. Please check your task details.');
        } else {
          toast.error('Failed to sync task to Google Calendar. Please try again.');
        }
      } else {
        toast.error('Failed to sync task to Google Calendar');
      }
      
      return null;
    }
  };

  const updateGoogleCalendarEvent = async (task: Task): Promise<void> => {
    if (!task.google_calendar_sync || !task.due_date || !task.google_calendar_event_id) {
      return;
    }

    try {
      console.log('🔄 Updating Google Calendar event for task:', task.title);
      const event = googleCalendarService.createEventFromTask(task);
      await googleCalendarService.updateEvent(task.google_calendar_event_id, event);
      toast.success('Calendar event updated successfully!');
    } catch (error) {
      console.error('❌ Failed to update Google Calendar event:', error);
      
      if (error instanceof Error && error.message.includes('expired')) {
        toast.error('Google Calendar access expired. Please sign out and sign in with Google again.');
      } else {
        toast.error('Failed to update Google Calendar event');
      }
    }
  };

  const deleteGoogleCalendarEvent = async (eventId: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting Google Calendar event:', eventId);
      await googleCalendarService.deleteEvent(eventId);
      toast.success('Calendar event deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete Google Calendar event:', error);
      
      if (error instanceof Error && error.message.includes('expired')) {
        toast.error('Google Calendar access expired. Please sign out and sign in with Google again.');
      } else {
        toast.error('Failed to delete Google Calendar event');
      }
    }
  };

  const createTask = useMutation({
    mutationFn: async (taskData: TaskInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();
      
      if (taskError) throw taskError;

      // Cast the result to Task type to ensure proper typing
      const task = taskResult as Task;

      // Sync to Google Calendar if enabled
      if (task.google_calendar_sync && task.due_date) {
        const eventId = await syncToGoogleCalendar(task);
        if (eventId) {
          const { error: updateError } = await supabase
            .from('tasks')
            .update({ google_calendar_event_id: eventId })
            .eq('id', task.id);
          
          if (updateError) {
            console.error('Failed to update task with calendar event ID:', updateError);
          } else {
            task.google_calendar_event_id = eventId;
          }
        }
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
    mutationFn: async ({ id, ...taskData }: Partial<Task> & { id: string }) => {
      const { data: taskResult, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Cast the result to Task type to ensure proper typing
      const data = taskResult as Task;

      // Handle Google Calendar sync
      if (data.google_calendar_sync && data.due_date) {
        if (data.google_calendar_event_id) {
          // Update existing event
          await updateGoogleCalendarEvent(data);
        } else {
          // Create new event
          const eventId = await syncToGoogleCalendar(data);
          if (eventId) {
            await supabase
              .from('tasks')
              .update({ google_calendar_event_id: eventId })
              .eq('id', id);
            data.google_calendar_event_id = eventId;
          }
        }
      } else if (data.google_calendar_event_id && (!data.google_calendar_sync || !data.due_date)) {
        // Delete calendar event if sync is disabled or due date removed
        await deleteGoogleCalendarEvent(data.google_calendar_event_id);
        await supabase
          .from('tasks')
          .update({ google_calendar_event_id: null })
          .eq('id', id);
        data.google_calendar_event_id = null;
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
      // Get the task to check for calendar event
      const { data: task } = await supabase
        .from('tasks')
        .select('google_calendar_event_id')
        .eq('id', id)
        .single();

      // Delete from Google Calendar if synced
      if (task?.google_calendar_event_id) {
        await deleteGoogleCalendarEvent(task.google_calendar_event_id);
      }

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

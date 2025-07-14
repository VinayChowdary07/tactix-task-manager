
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export const useTimeTracking = (taskId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  // Get time logs for the task
  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timeLogs', taskId],
    queryFn: async () => {
      if (!user || !taskId) return [];
      
      const { data, error } = await supabase
        .from('task_time_logs')
        .select('*')
        .eq('task_id', taskId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as TimeLog[];
    },
    enabled: !!user && !!taskId,
  });

  // Start timer mutation
  const startTimer = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('task_time_logs')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          started_at: now
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setIsTracking(true);
      setStartTime(new Date());
      setElapsedTime(0);
      setActiveLogId(data.id);
      toast.success('Timer started!');
    },
    onError: (error) => {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
    },
  });

  // Stop timer mutation
  const stopTimer = useMutation({
    mutationFn: async () => {
      if (!activeLogId) throw new Error('No active timer');
      
      const now = new Date().toISOString();
      const durationMinutes = Math.floor(elapsedTime / 60);
      
      const { data, error } = await supabase
        .from('task_time_logs')
        .update({
          ended_at: now,
          duration_minutes: durationMinutes
        })
        .eq('id', activeLogId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update task's time_spent by getting current value and adding duration
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('time_spent')
        .eq('id', taskId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newTimeSpent = (currentTask.time_spent || 0) + durationMinutes;
      
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ time_spent: newTimeSpent })
        .eq('id', taskId);
      
      if (taskError) throw taskError;
      
      return data;
    },
    onSuccess: () => {
      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
      setActiveLogId(null);
      queryClient.invalidateQueries({ queryKey: ['timeLogs', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Timer stopped!');
    },
    onError: (error) => {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
    },
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTimeSpent = timeLogs
    .filter(log => log.duration_minutes)
    .reduce((total, log) => total + (log.duration_minutes || 0), 0);

  return {
    isTracking,
    elapsedTime,
    timeLogs,
    totalTimeSpent,
    startTimer,
    stopTimer,
    formatTime,
  };
};

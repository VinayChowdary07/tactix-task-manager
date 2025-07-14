
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks, Task } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { X, Bell, Repeat, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultProjectId?: string | null;
  defaultDueDate?: Date;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  defaultProjectId,
  defaultDueDate 
}) => {
  const { createTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    reminder_time: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'Todo' as 'Todo' | 'In Progress' | 'Done',
    project_id: 'none',
    repeat_type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'custom',
    repeat_interval: 1,
    repeat_until: '',
    time_estimate: '',
    google_calendar_sync: true
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
          reminder_time: task.reminder_time ? format(new Date(task.reminder_time), "yyyy-MM-dd'T'HH:mm") : '',
          priority: task.priority,
          status: task.status,
          project_id: task.project_id || 'none',
          repeat_type: task.repeat_type || 'none',
          repeat_interval: task.repeat_interval || 1,
          repeat_until: task.repeat_until ? format(new Date(task.repeat_until), 'yyyy-MM-dd') : '',
          time_estimate: task.time_estimate ? Math.floor(task.time_estimate / 60).toString() : '',
          google_calendar_sync: task.google_calendar_sync !== false
        });
      } else {
        setFormData({
          title: '',
          description: '',
          due_date: defaultDueDate ? format(defaultDueDate, 'yyyy-MM-dd') : '',
          reminder_time: '',
          priority: 'Medium',
          status: 'Todo',
          project_id: defaultProjectId || 'none',
          repeat_type: 'none',
          repeat_interval: 1,
          repeat_until: '',
          time_estimate: '',
          google_calendar_sync: true
        });
      }
    }
  }, [task, isOpen, defaultProjectId, defaultDueDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    const taskData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      reminder_time: formData.reminder_time ? new Date(formData.reminder_time).toISOString() : undefined,
      repeat_until: formData.repeat_until ? new Date(formData.repeat_until).toISOString() : undefined,
      time_estimate: formData.time_estimate ? parseInt(formData.time_estimate) * 60 : undefined,
      project_id: formData.project_id === 'none' ? null : formData.project_id
    };

    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          ...taskData
        });
      } else {
        await createTask.mutateAsync(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-dark border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto neon-border-cyan">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center justify-between">
            {task ? 'Edit Task' : 'Create New Task'}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Title and Description */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300 font-medium">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300 font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 resize-none min-h-[100px]"
                placeholder="Task description (optional)"
                rows={4}
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-300 font-medium">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Critical') => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="Low" className="text-green-400 focus:bg-slate-700">Low Priority</SelectItem>
                  <SelectItem value="Medium" className="text-yellow-400 focus:bg-slate-700">Medium Priority</SelectItem>
                  <SelectItem value="High" className="text-red-400 focus:bg-slate-700">High Priority</SelectItem>
                  <SelectItem value="Critical" className="text-red-600 font-bold focus:bg-slate-700">Critical Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-300 font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Todo' | 'In Progress' | 'Done') => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="Todo" className="text-slate-400 focus:bg-slate-700">Todo</SelectItem>
                  <SelectItem value="In Progress" className="text-blue-400 focus:bg-slate-700">In Progress</SelectItem>
                  <SelectItem value="Done" className="text-green-400 focus:bg-slate-700">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Time Estimate */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-slate-300 font-medium">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_estimate" className="text-slate-300 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Estimate (hours)
              </Label>
              <Input
                id="time_estimate"
                type="number"
                min="0"
                step="0.5"
                value={formData.time_estimate}
                onChange={(e) => setFormData({ ...formData, time_estimate: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                placeholder="Estimated hours"
              />
            </div>
          </div>

          {/* Google Calendar Sync Toggle */}
          <div className="space-y-4 p-6 glass-card rounded-lg neon-border-cyan">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <div>
                  <Label className="text-slate-300 font-medium">Sync with Google Calendar</Label>
                  <p className="text-sm text-slate-400">Automatically create calendar events for tasks with due dates</p>
                </div>
              </div>
              <Switch
                checked={formData.google_calendar_sync}
                onCheckedChange={(checked) => setFormData({ ...formData, google_calendar_sync: checked })}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          </div>

          {/* Reminder Time */}
          <div className="space-y-2">
            <Label htmlFor="reminder_time" className="text-slate-300 font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Reminder Time
            </Label>
            <Input
              id="reminder_time"
              type="datetime-local"
              value={formData.reminder_time}
              onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
            />
          </div>

          {/* Recurring Task Section */}
          <div className="space-y-4 p-6 glass-card rounded-lg neon-border-purple">
            <Label className="text-slate-300 font-medium flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-400" />
              Recurring Task
            </Label>
            
            <div className="space-y-4">
              <Select value={formData.repeat_type} onValueChange={(value: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom') => setFormData({ ...formData, repeat_type: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-400 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="none" className="text-slate-400 focus:bg-slate-700">No Repeat</SelectItem>
                  <SelectItem value="daily" className="text-blue-400 focus:bg-slate-700">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-green-400 focus:bg-slate-700">Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-yellow-400 focus:bg-slate-700">Monthly</SelectItem>
                  <SelectItem value="custom" className="text-purple-400 focus:bg-slate-700">Custom</SelectItem>
                </SelectContent>
              </Select>

              {formData.repeat_type !== 'none' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-400">Interval</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.repeat_interval}
                      onChange={(e) => setFormData({ ...formData, repeat_interval: parseInt(e.target.value) || 1 })}
                      className="bg-slate-800/50 border-slate-600 text-white text-sm h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-400">Until</Label>
                    <Input
                      type="date"
                      value={formData.repeat_until}
                      onChange={(e) => setFormData({ ...formData, repeat_until: e.target.value })}
                      className="bg-slate-800/50 border-slate-600 text-white text-sm h-10"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label className="text-slate-300 font-medium">Project</Label>
            <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 h-12">
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="none" className="text-slate-400 focus:bg-slate-700">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id} className="text-white focus:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || '#6366f1' }}
                      />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all h-12 font-semibold"
            >
              {createTask.isPending || updateTask.isPending ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

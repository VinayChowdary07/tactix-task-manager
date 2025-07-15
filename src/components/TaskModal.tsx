
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { X, CheckSquare, Calendar, Flag } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  const { createTask, updateTask, deleteTask } = useTasks();
  const { projects = [] } = useProjects();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'Todo' as 'Todo' | 'In Progress' | 'Done',
    project_id: '',
    time_estimate: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setFormData({
          title: task.title || '',
          description: task.description || '',
          due_date: task.due_date ? task.due_date.split('T')[0] : '',
          priority: task.priority || 'Medium',
          status: task.status || 'Todo',
          project_id: task.project_id || '',
          time_estimate: task.time_estimate || 0
        });
      } else {
        // Creating new task
        setFormData({
          title: '',
          description: '',
          due_date: '',
          priority: 'Medium',
          status: 'Todo',
          project_id: '',
          time_estimate: 0
        });
      }
      setError('');
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description || undefined,
        due_date: formData.due_date || undefined,
        priority: formData.priority,
        status: formData.status,
        project_id: formData.project_id || undefined,
        time_estimate: formData.time_estimate || undefined
      };

      if (task) {
        // Update existing task
        await updateTask.mutateAsync({ id: task.id, ...taskData });
      } else {
        // Create new task
        await createTask.mutateAsync(taskData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(task.id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const priorityColors = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
    Critical: '#dc2626'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/10">
        <DialogHeader className="relative border-b border-slate-700/50 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          {task && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="absolute right-0 top-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 transition-all"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-slate-300 font-medium">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 mt-2"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-300 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 resize-none focus:border-cyan-400 focus:ring-cyan-400/20 mt-2"
                  placeholder="Describe the task"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="due_date" className="text-slate-300 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-slate-800/50 border-slate-600/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="time_estimate" className="text-slate-300 font-medium">Time Estimate (minutes)</Label>
                <Input
                  id="time_estimate"
                  type="number"
                  value={formData.time_estimate || ''}
                  onChange={(e) => setFormData({ ...formData, time_estimate: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 mt-2"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 font-medium flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-cyan-400 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {Object.entries(priorityColors).map(([priority, color]) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                          {priority}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-cyan-400 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 font-medium">Project</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-cyan-400 mt-2">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: project.color || '#6366f1' }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

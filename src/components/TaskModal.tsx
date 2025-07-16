
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
import { ColorPicker } from '@/components/ui/color-picker';
import { useTasks, Task, Subtask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/lib/auth';
import { CheckSquare, Calendar, Flag, Plus, X, RotateCw, Palette } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => Promise<void>;
  task?: Task | null;
  projects: any[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, projects }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    start_date: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'Todo' as 'Todo' | 'In Progress' | 'Done',
    project_id: 'none',
    recurring: false,
    repeat_type: 'none' as 'daily' | 'weekly' | 'monthly' | 'none',
    repeat_interval: 1,
    repeat_until: '',
    completed: false,
    color: '#6366f1'
  });

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Don't render the modal if auth is still loading
  if (authLoading) {
    return null;
  }

  // Don't render if user is not authenticated
  if (!user) {
    console.log('TaskModal: User not authenticated, closing modal');
    if (isOpen) {
      onClose();
    }
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          due_date: task.due_date ? task.due_date.split('T')[0] : '',
          start_date: task.start_date ? task.start_date.split('T')[0] : '',
          priority: task.priority || 'Medium',
          status: task.status || 'Todo',
          project_id: task.project_id || 'none',
          recurring: task.recurring || false,
          repeat_type: task.repeat_type || 'none',
          repeat_interval: task.repeat_interval || 1,
          repeat_until: task.repeat_until ? task.repeat_until.split('T')[0] : '',
          completed: task.completed || false,
          color: task.color || '#6366f1'
        });
        setSubtasks(task.subtasks || []);
      } else {
        setFormData({
          title: '',
          description: '',
          due_date: '',
          start_date: '',
          priority: 'Medium',
          status: 'Todo',
          project_id: 'none',
          recurring: false,
          repeat_type: 'none',
          repeat_interval: 1,
          repeat_until: '',
          completed: false,
          color: '#6366f1'
        });
        setSubtasks([]);
      }
      setNewSubtask('');
      setError('');
    }
  }, [task, isOpen]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskItem: Subtask = {
        id: crypto.randomUUID(),
        title: newSubtask.trim(),
        completed: false
      };
      setSubtasks([...subtasks, newSubtaskItem]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Please sign in to create or edit tasks.');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        due_date: formData.due_date || undefined,
        start_date: formData.start_date || undefined,
        priority: formData.priority,
        status: formData.status,
        project_id: formData.project_id === 'none' ? undefined : formData.project_id,
        recurring: formData.recurring,
        repeat_type: formData.recurring ? formData.repeat_type : 'none',
        repeat_interval: formData.recurring ? formData.repeat_interval : undefined,
        repeat_until: formData.recurring && formData.repeat_until ? formData.repeat_until : undefined,
        subtasks: subtasks,
        completed: formData.completed,
        color: formData.color
      };

      console.log('Submitting task data:', taskData);

      await onSave(taskData);
      
      onClose();
    } catch (error: any) {
      console.error('Task submission error:', error);
      setError(error?.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/10">
        <DialogHeader className="border-b border-slate-700/50 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-slate-300 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-slate-800/50 border-slate-600/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20 mt-2"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <Label className="text-slate-300 font-medium flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4" />
                  Task Color
                </Label>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <ColorPicker
                    selectedColor={formData.color}
                    onColorChange={(color) => setFormData({ ...formData, color })}
                  />
                </div>
              </div>

              {/* Completed Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <Label className="text-slate-300 font-medium">Mark as Completed</Label>
                  <p className="text-sm text-slate-400">Task is finished and complete</p>
                </div>
                <Switch
                  checked={formData.completed}
                  onCheckedChange={(checked) => setFormData({ ...formData, completed: checked })}
                  disabled={isSubmitting}
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
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  disabled={isSubmitting}
                >
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
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  disabled={isSubmitting}
                >
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
                <Select 
                  value={formData.project_id} 
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-cyan-400 mt-2">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="none">No Project</SelectItem>
                    {Array.from(projects || []).map((project) => (
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

              {/* Recurring Task Settings */}
              <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300 font-medium flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      Recurring Task
                    </Label>
                    <p className="text-sm text-slate-400">Automatically create new instances</p>
                  </div>
                  <Switch
                    checked={formData.recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
                    disabled={isSubmitting}
                  />
                </div>

                {formData.recurring && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300 text-sm">Repeat Type</Label>
                      <Select 
                        value={formData.repeat_type} 
                        onValueChange={(value: any) => setFormData({ ...formData, repeat_type: value })}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-sm">Every</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.repeat_interval}
                        onChange={(e) => setFormData({ ...formData, repeat_interval: parseInt(e.target.value) || 1 })}
                        className="bg-slate-700/50 border-slate-600/50 text-white text-sm mt-1"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-slate-300 text-sm">Repeat Until (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.repeat_until}
                        onChange={(e) => setFormData({ ...formData, repeat_until: e.target.value })}
                        className="bg-slate-700/50 border-slate-600/50 text-white text-sm mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-medium">Subtasks</Label>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtask.id)}
                    className="w-4 h-4 text-cyan-400 bg-slate-700 border-slate-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {subtask.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtask(subtask.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-400"
                  disabled={isSubmitting}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button
                  type="button"
                  onClick={addSubtask}
                  disabled={!newSubtask.trim() || isSubmitting}
                  className="bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
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
              disabled={isSubmitting || !formData.title.trim() || !user?.id}
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

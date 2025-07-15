
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Calendar, 
  Flag, 
  Plus, 
  X, 
  RotateCw,
  Folder,
  Clock,
  Edit
} from 'lucide-react';
import { Task, Subtask, useTasks } from '@/hooks/useTasks';
import { Project as ProjectType } from '@/hooks/useProjects';
import { format } from 'date-fns';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projects: ProjectType[];
  onEdit: (task: Task) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  projects, 
  onEdit 
}) => {
  const { updateTask } = useTasks();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || []);
      setIsCompleted(task.completed || false);
    }
  }, [task]);

  const project = projects.find(p => p.id === task.project_id);

  const priorityConfig = {
    Low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    Critical: { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' },
  };

  const statusConfig = {
    Todo: { color: 'text-slate-400', bg: 'bg-slate-800/50' },
    'In Progress': { color: 'text-orange-400', bg: 'bg-orange-500/10' },
    Done: { color: 'text-green-400', bg: 'bg-green-500/10' },
  };

  const priorityStyle = priorityConfig[task.priority];
  const statusStyle = statusConfig[task.status];

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleSubtaskToggle = async (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updatedSubtasks);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Error updating subtask:', error);
      // Revert on error
      setSubtasks(task.subtasks || []);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    const newSubtaskItem: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false
    };

    const updatedSubtasks = [...subtasks, newSubtaskItem];
    setSubtasks(updatedSubtasks);
    setNewSubtask('');

    try {
      await updateTask.mutateAsync({
        id: task.id,
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Error adding subtask:', error);
      // Revert on error
      setSubtasks(subtasks);
      setNewSubtask(newSubtaskItem.title);
    }
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
    setSubtasks(updatedSubtasks);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Error removing subtask:', error);
      // Revert on error
      setSubtasks(task.subtasks || []);
    }
  };

  const handleTaskCompletion = async (completed: boolean) => {
    setIsCompleted(completed);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        completed,
        status: completed ? 'Done' : 'Todo'
      });
    } catch (error) {
      console.error('Error updating task completion:', error);
      // Revert on error
      setIsCompleted(!completed);
    }
  };

  // Auto-suggest completion when all subtasks are done
  const allSubtasksCompleted = totalSubtasks > 0 && completedSubtasks === totalSubtasks;
  const shouldSuggestCompletion = allSubtasksCompleted && !isCompleted;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/10">
        <DialogHeader className="border-b border-slate-700/50 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              Task Details
            </DialogTitle>
            <Button
              onClick={() => onEdit(task)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Task Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h2 className={`text-2xl font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                {task.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Mark Complete</span>
                <Switch
                  checked={isCompleted}
                  onCheckedChange={handleTaskCompletion}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>

            {task.description && (
              <p className={`text-slate-300 leading-relaxed ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                {task.description}
              </p>
            )}

            {/* Auto-completion suggestion */}
            {shouldSuggestCompletion && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm">🎉 All subtasks completed! Mark this task as done?</span>
                  <Button
                    onClick={() => handleTaskCompletion(true)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Task Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dates */}
            <div className="space-y-3">
              {task.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">
                    Start: {format(new Date(task.start_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">
                    Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>

            {/* Status and Priority */}
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusStyle.bg}`}>
                <div className={`w-2 h-2 rounded-full ${statusStyle.color.replace('text-', 'bg-')}`} />
                <span className={`text-sm font-medium ${statusStyle.color}`}>
                  {task.status}
                </span>
              </div>

              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.border} border ml-2`}>
                <Flag className={`w-3 h-3 ${priorityStyle.color}`} />
                <span className={`text-sm font-medium ${priorityStyle.color}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Project and Recurring Info */}
          <div className="flex flex-wrap items-center gap-4">
            {project && (
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-500" />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />
                <span className="text-sm text-slate-400">{project.name}</span>
              </div>
            )}
            
            {task.recurring && (
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">
                  Repeats {task.repeat_type} (every {task.repeat_interval})
                </span>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          {(totalSubtasks > 0 || newSubtask) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </h3>
              </div>

              {/* Progress Bar */}
              {totalSubtasks > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-400 font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2 bg-slate-800"
                  />
                </div>
              )}

              {/* Subtasks List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 group">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleSubtaskToggle(subtask.id)}
                      className="w-4 h-4 text-cyan-400 bg-slate-700 border-slate-600 rounded focus:ring-cyan-400 focus:ring-2"
                    />
                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {subtask.title}
                    </span>
                    <Button
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Subtask */}
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add First Subtask Button */}
          {totalSubtasks === 0 && !newSubtask && (
            <Button
              onClick={() => setNewSubtask('')}
              variant="outline"
              className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-cyan-400/50 hover:text-cyan-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subtasks
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;

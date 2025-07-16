
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
  Edit,
  FileText,
  Target,
  Palette
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
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  projects, 
  onEdit,
  onDelete,
  onToggleComplete 
}) => {
  const { updateTask } = useTasks();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  useEffect(() => {
    if (task) {
      console.log('TaskDetailsModal: Loading task data:', task);
      console.log('TaskDetailsModal: Task subtasks:', task.subtasks);
      setSubtasks(task.subtasks || []);
      setIsCompleted(task.completed || false);
      setShowAddSubtask(false);
      setNewSubtask('');
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
    Todo: { color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-600/50' },
    'In Progress': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    Done: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
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
    setShowAddSubtask(false);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Error adding subtask:', error);
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
      setSubtasks(task.subtasks || []);
    }
  };

  const handleTaskCompletion = async (completed: boolean) => {
    setIsCompleted(completed);
    await onToggleComplete(task);
  };

  const allSubtasksCompleted = totalSubtasks > 0 && completedSubtasks === totalSubtasks;
  const shouldSuggestCompletion = allSubtasksCompleted && !isCompleted;

  const handleClose = () => {
    setShowAddSubtask(false);
    setNewSubtask('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/10 rounded-2xl">
        <DialogHeader className="border-b border-slate-700/30 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <CheckSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Task Details
                </DialogTitle>
                <p className="text-slate-400 text-sm">Manage and track your task progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => onEdit(task)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-xl p-2"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Task Header */}
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                {task.color && (
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.color }}
                  />
                )}
                <h2 className={`text-3xl font-bold leading-tight ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                  {task.title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 font-medium">Mark Complete</span>
                <Switch
                  checked={isCompleted}
                  onCheckedChange={handleTaskCompletion}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>

            {/* Task Color Display */}
            {task.color && (
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Palette className="w-4 h-4 text-slate-500" />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg border border-slate-600"
                      style={{ backgroundColor: task.color }}
                    />
                    <div>
                      <span className="text-xs text-slate-400 block">Task Color</span>
                      <span className="text-sm text-white font-medium">{task.color}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Display */}
            {project && (
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Folder className="w-4 h-4 text-slate-500" />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <div>
                      <span className="text-xs text-slate-400 block">Project</span>
                      <span className="text-sm text-white font-medium">{project.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {task.description && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-300">Description</span>
                </div>
                <p className={`text-slate-300 leading-relaxed pl-6 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                  {task.description}
                </p>
              </div>
            )}

            {/* Auto-completion suggestion */}
            {shouldSuggestCompletion && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">🎉 All subtasks completed! Ready to mark this task as done?</span>
                  </div>
                  <Button
                    onClick={() => handleTaskCompletion(true)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg"
                  >
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Task Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dates & Schedule */}
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Schedule
              </h3>
              <div className="space-y-4">
                {task.start_date && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">Start Date</span>
                      <span className="text-sm text-white font-medium">
                        {format(new Date(task.start_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">Due Date</span>
                      <span className="text-sm text-white font-medium">
                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
                {task.recurring && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <RotateCw className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">Recurrence</span>
                      <span className="text-sm text-white font-medium">
                        Repeats {task.repeat_type} (every {task.repeat_interval})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Priority */}
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-cyan-400" />
                Status & Priority
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${statusStyle.bg} border ${statusStyle.border || 'border-slate-600/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusStyle.color.replace('text-', 'bg-')}`} />
                    <div>
                      <span className="text-xs text-slate-400 block">Status</span>
                      <span className={`text-lg font-bold ${statusStyle.color}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${priorityStyle.bg} border ${priorityStyle.border}`}>
                  <div className="flex items-center gap-3">
                    <Flag className={`w-4 h-4 ${priorityStyle.color}`} />
                    <div>
                      <span className="text-xs text-slate-400 block">Priority</span>
                      <span className={`text-lg font-bold ${priorityStyle.color}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <CheckSquare className="w-6 h-6 text-cyan-400" />
                Subtasks
                {totalSubtasks > 0 && (
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    {completedSubtasks}/{totalSubtasks}
                  </Badge>
                )}
              </h3>
              <Button
                onClick={() => setShowAddSubtask(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subtask
              </Button>
            </div>

            {/* Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-cyan-400 font-bold">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-3 bg-slate-700/50 rounded-full overflow-hidden"
                />
              </div>
            )}

            {/* Add New Subtask Input */}
            {showAddSubtask && (
              <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <div className="flex gap-3">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Enter subtask description..."
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-cyan-400 rounded-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubtask();
                      } else if (e.key === 'Escape') {
                        setShowAddSubtask(false);
                        setNewSubtask('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddSubtask(false);
                      setNewSubtask('');
                    }}
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 px-4 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Subtasks List */}
            {totalSubtasks > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 group hover:bg-slate-700/50 transition-all">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleSubtaskToggle(subtask.id)}
                      className="w-5 h-5 text-cyan-400 bg-slate-700 border-slate-600 rounded focus:ring-cyan-400 focus:ring-2"
                    />
                    <span className={`flex-1 text-base ${subtask.completed ? 'line-through text-slate-400' : 'text-white'} transition-all`}>
                      {subtask.title}
                    </span>
                    <Button
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : !showAddSubtask ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-4">No subtasks yet</p>
                <Button
                  onClick={() => setShowAddSubtask(true)}
                  variant="outline"
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-cyan-400/50 hover:text-cyan-400 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Subtask
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;


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
import { Checkbox } from '@/components/ui/checkbox';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { X, Target, Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal }) => {
  const { createGoal, updateGoal, deleteGoal } = useGoals();
  const { tasks } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    taskIds: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setFormData({
          title: goal.title,
          description: goal.description || '',
          target_date: goal.target_date ? format(new Date(goal.target_date), 'yyyy-MM-dd') : '',
          taskIds: goal.goal_tasks?.map(gt => gt.task_id) || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          target_date: '',
          taskIds: []
        });
      }
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    const goalData = {
      ...formData,
      target_date: formData.target_date ? new Date(formData.target_date).toISOString() : undefined
    };

    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          ...goalData
        });
      } else {
        await createGoal.mutateAsync(goalData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async () => {
    if (goal && window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal.mutateAsync(goal.id);
        onClose();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      taskIds: prev.taskIds.includes(taskId)
        ? prev.taskIds.filter(id => id !== taskId)
        : [...prev.taskIds, taskId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-dark border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              {goal ? 'Edit Goal' : 'Create New Goal'}
            </div>
            <div className="flex items-center gap-2">
              {goal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              placeholder="Enter your goal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 resize-none"
              placeholder="Describe your goal (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date" className="text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Target Date
            </Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Link Tasks to Goal
            </Label>
            <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              {tasks.length === 0 ? (
                <p className="text-slate-500 text-sm">No tasks available. Create some tasks first.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg">
                    <Checkbox
                      id={task.id}
                      checked={formData.taskIds.includes(task.id)}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                      className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label
                      htmlFor={task.id}
                      className="flex-1 cursor-pointer text-sm text-white hover:text-cyan-400 transition-colors"
                    >
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-slate-400">
                        {task.status} • {task.priority} Priority
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
            {formData.taskIds.length > 0 && (
              <p className="text-sm text-cyan-400">
                {formData.taskIds.length} task{formData.taskIds.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGoal.isPending || updateGoal.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all"
            >
              {createGoal.isPending || updateGoal.isPending ? 'Saving...' : (goal ? 'Update Goal' : 'Create Goal')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { X, Target, Calendar, Tag, Palette, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

const GOAL_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal }) => {
  const { createGoal, updateGoal, deleteGoal } = useGoals();
  const { tasks } = useTasks();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    target_date: '',
    goal_type: 'personal' as 'personal' | 'team' | 'recurring',
    tags: [] as string[],
    color: '#6366f1',
    notes: '',
    status: 'active' as 'active' | 'completed' | 'paused' | 'archived',
    taskIds: [] as string[],
    milestones: [] as Array<{ title: string; description: string; target_date: string }>
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setFormData({
          title: goal.title,
          description: goal.description || '',
          start_date: goal.start_date ? format(new Date(goal.start_date), 'yyyy-MM-dd') : '',
          target_date: goal.target_date ? format(new Date(goal.target_date), 'yyyy-MM-dd') : '',
          goal_type: goal.goal_type,
          tags: goal.tags || [],
          color: goal.color,
          notes: goal.notes || '',
          status: goal.status,
          taskIds: goal.goal_tasks?.map(gt => gt.task_id) || [],
          milestones: goal.goal_milestones?.map(m => ({
            title: m.title,
            description: m.description || '',
            target_date: m.target_date ? format(new Date(m.target_date), 'yyyy-MM-dd') : ''
          })) || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          start_date: '',
          target_date: '',
          goal_type: 'personal',
          tags: [],
          color: '#6366f1',
          notes: '',
          status: 'active',
          taskIds: [],
          milestones: []
        });
      }
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const goalData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      target_date: formData.target_date ? new Date(formData.target_date).toISOString() : undefined,
      milestones: formData.milestones.map(m => ({
        ...m,
        target_date: m.target_date ? new Date(m.target_date).toISOString() : undefined
      }))
    };

    try {
      if (goal) {
        await updateGoal.mutateAsync({ id: goal.id, ...goalData });
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', target_date: '' }]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-slate-300">Goal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Enter your goal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white resize-none"
                  placeholder="Describe your goal"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-slate-300">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="target_date" className="text-slate-300">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Goal Type</Label>
                  <Select value={formData.goal_type} onValueChange={(value: any) => setFormData({ ...formData, goal_type: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Goal Color
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-white scale-110' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm" className="bg-slate-700 hover:bg-slate-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-slate-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Link Tasks</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 bg-slate-800 p-3 rounded-lg border border-slate-600">
                  {tasks.length === 0 ? (
                    <p className="text-slate-500 text-sm">No tasks available</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={task.id}
                          checked={formData.taskIds.includes(task.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({ ...prev, taskIds: [...prev.taskIds, task.id] }));
                            } else {
                              setFormData(prev => ({ ...prev, taskIds: prev.taskIds.filter(id => id !== task.id) }));
                            }
                          }}
                          className="border-slate-600"
                        />
                        <label htmlFor={task.id} className="text-sm text-white">
                          {task.title}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Milestones</Label>
                  <Button type="button" onClick={addMilestone} size="sm" className="bg-slate-700 hover:bg-slate-600">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3 mt-2 max-h-48 overflow-y-auto">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Milestone {index + 1}</span>
                        <Button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Milestone title"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                        />
                        <Input
                          type="date"
                          value={milestone.target_date}
                          onChange={(e) => updateMilestone(index, 'target_date', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-slate-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white resize-none"
              placeholder="Additional notes about this goal"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGoal.isPending || updateGoal.isPending}
              className="flex-1"
              style={{ backgroundColor: formData.color }}
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

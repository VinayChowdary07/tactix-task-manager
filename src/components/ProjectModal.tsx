
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
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProjects, Project } from '@/hooks/useProjects';
import { X, Calendar as CalendarIcon, Users, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

const colors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
];

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Planning', 'Active', 'On Hold', 'Completed'];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const { createProject, updateProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    priority: 'Medium',
    status: 'Planning',
    dueDate: null as Date | null,
    teamSize: 1
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color || '#6366f1',
        priority: 'Medium',
        status: 'Active',
        dueDate: null,
        teamSize: 1
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
        priority: 'Medium',
        status: 'Planning',
        dueDate: null,
        teamSize: 1
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        color: formData.color
      };

      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          ...projectData
        });
      } else {
        await createProject.mutateAsync(projectData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'On Hold': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Planning': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-dark border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient flex items-center justify-between">
            {project ? 'Edit Project' : 'Create New Project'}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              placeholder="Project description (optional)"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300">Project Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    formData.color === color 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-slate-300">Priority</Label>
              <div className="flex gap-2">
                {priorities.map((priority) => (
                  <Badge
                    key={priority}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      formData.priority === priority 
                        ? getPriorityColor(priority)
                        : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-600/50'
                    }`}
                    onClick={() => setFormData({ ...formData, priority })}
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300">Status</Label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      formData.status === status 
                        ? getStatusColor(status)
                        : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-600/50'
                    }`}
                    onClick={() => setFormData({ ...formData, status })}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-slate-300">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50",
                    !formData.dueDate && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date || null })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Team Size */}
          <div className="space-y-2">
            <Label htmlFor="teamSize" className="text-slate-300">Team Size</Label>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-slate-400" />
              <Input
                id="teamSize"
                type="number"
                min="1"
                max="50"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 w-24"
              />
              <span className="text-slate-400 text-sm">members</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
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
              disabled={createProject.isPending || updateProject.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all"
            >
              {createProject.isPending || updateProject.isPending ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;

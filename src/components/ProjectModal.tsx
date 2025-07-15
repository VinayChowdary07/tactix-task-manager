
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
import { useProjects, Project } from '@/hooks/useProjects';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

const colors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const { createProject, updateProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      const data = {
        name: project.name || '',
        description: project.description || '',
        color: project.color || '#6366f1'
      };
      setFormData(data);
      setOriginalData(data);
    } else if (!project && isOpen) {
      const data = {
        name: '',
        description: '',
        color: '#6366f1'
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [project, isOpen]);

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.color !== originalData.color
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    // If editing and no changes, just close the modal
    if (project && !hasChanges()) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
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
      // Error toast is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-dark border-slate-700/50 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient flex items-center justify-between">
            {project ? 'Edit Project' : 'Create New Project'}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
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
                  className={`w-12 h-12 rounded-lg transition-all border-2 ${
                    formData.color === color 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!project && !formData.name.trim())}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;

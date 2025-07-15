
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects, Project } from '@/hooks/useProjects';
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

const priorities = ['Low', 'Medium', 'High'] as const;

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const { createProject, updateProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing existing project
        const data = {
          name: project.name || '',
          description: project.description || '',
          color: project.color || '#6366f1',
          priority: (project.priority || 'Medium') as 'Low' | 'Medium' | 'High'
        };
        setFormData(data);
        setOriginalData(data);
        console.log('Loaded project for editing:', data);
      } else {
        // Creating new project
        const data = {
          name: '',
          description: '',
          color: '#6366f1',
          priority: 'Medium' as 'Low' | 'Medium' | 'High'
        };
        setFormData(data);
        setOriginalData(data);
        console.log('Reset form for new project');
      }
    }
  }, [project, isOpen]);

  const hasChanges = () => {
    const changed = (
      formData.name.trim() !== originalData.name.trim() ||
      formData.description.trim() !== originalData.description.trim() ||
      formData.color !== originalData.color ||
      formData.priority !== originalData.priority
    );
    console.log('Has changes:', changed, { formData, originalData });
    return changed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    // If editing and no changes, just close the modal
    if (project && !hasChanges()) {
      console.log('No changes detected, closing modal');
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        priority: formData.priority
      };

      console.log('Submitting project data:', projectData);

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

  const handleInputChange = (field: string, value: string) => {
    console.log('Input change:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
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
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              placeholder="Project description (optional)"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-slate-300">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority} className="text-white hover:bg-slate-700">
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300">Project Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-12 h-12 rounded-lg transition-all border-2 ${
                    formData.color === color 
                      ? 'border-white scale-110 shadow-lg' 
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
              className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!project && !formData.name.trim()) || (project && !hasChanges())}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
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

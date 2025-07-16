import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen, Search, Filter, Target, CheckCircle2, Clock, Users, Edit, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects, Project } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import ProjectModal from '@/components/ProjectModal';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const Projects = () => {
  const { projects, isLoading, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'Done');
    const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
    
    return {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      progress
    };
  };

  const getOverallStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.filter(t => t.project_id).length;

    return [
      { label: 'Total Projects', value: totalProjects, icon: FolderOpen, color: 'text-cyan-400' },
      { label: 'Active Projects', value: activeProjects, icon: Target, color: 'text-blue-400' },
      { label: 'Completed', value: completedProjects, icon: CheckCircle2, color: 'text-green-400' },
      { label: 'Project Tasks', value: totalTasks, icon: Clock, color: 'text-purple-400' },
    ];
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProject(project);
  };

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    
    try {
      await deleteProject.mutateAsync(deletingProject.id);
      setDeletingProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingProject(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects Dashboard</h1>
            <p className="text-slate-400">Organize your work and track project progress</p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {getOverallStats().map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Create your first project to start organizing your tasks and tracking progress.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project.id);
              const statusColors = {
                active: 'text-blue-400',
                completed: 'text-green-400',
                on_hold: 'text-yellow-400',
                archived: 'text-slate-400'
              };

              return (
                <Card 
                  key={project.id}
                  className="group relative bg-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-[1.02] overflow-hidden"
                >
                  {/* Color accent bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => handleEditProject(project, e)}
                      className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors backdrop-blur-sm"
                      title="Edit project"
                    >
                      <Edit className="w-4 h-4 text-slate-300 hover:text-white" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project, e)}
                      className="p-2 bg-slate-800/80 hover:bg-red-600 rounded-lg transition-colors backdrop-blur-sm"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4 text-slate-300 hover:text-white" />
                    </button>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between pr-16">
                        <div className="flex items-center gap-2 flex-1">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: project.color || '#6366f1' }}
                          />
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                              {project.name}
                            </h3>
                            <span className={`text-xs capitalize ${statusColors[project.status] || 'text-slate-400'}`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Progress</span>
                          <span className="text-sm font-medium text-white">{stats.progress}%</span>
                        </div>
                        
                        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${stats.progress}%`,
                              backgroundColor: project.color || '#6366f1',
                              boxShadow: `0 0 10px ${project.color || '#6366f1'}40`
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: project.color || '#6366f1' }}>
                            {stats.completedTasks}
                          </div>
                          <div className="text-xs text-slate-500">Tasks Done</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400">
                            {stats.totalTasks}
                          </div>
                          <div className="text-xs text-slate-500">Total Tasks</div>
                        </div>
                      </div>

                      {/* Team members if available */}
                      {project.team_members && project.team_members.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>{project.team_members.length} member{project.team_members.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Floating Action Button */}
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-2xl hover:shadow-cyan-500/25 hover:scale-110 transition-all z-50"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Project Modal */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          project={editingProject}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={!!deletingProject}
          onClose={handleCloseDeleteDialog}
          onConfirm={confirmDeleteProject}
          title="Delete Project"
          description={`Are you sure you want to delete "${deletingProject?.name}"? This will remove all associated tasks and data. This action cannot be undone.`}
          confirmText="Delete Project"
          cancelText="Cancel"
          isDestructive={true}
        />
      </div>
    </div>
  );
};

export default Projects;

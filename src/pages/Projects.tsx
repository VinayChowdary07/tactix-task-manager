
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  Plus, 
  Users, 
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Target
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectModal from '@/components/ProjectModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Projects = () => {
  const { projects, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject.mutateAsync(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const getProjectColorStyle = (color?: string) => {
    return color ? { backgroundColor: color } : { backgroundColor: '#6366f1' };
  };

  const stats = [
    { 
      label: 'Total Projects', 
      value: projects.length.toString(), 
      icon: FolderOpen, 
      gradient: 'btn-gradient-blue',
      glow: 'glow-cyan'
    },
    { 
      label: 'In Progress', 
      value: filteredProjects.filter(p => p.progress && p.progress > 0 && p.progress < 100).length.toString(), 
      icon: Clock, 
      gradient: 'btn-gradient-orange',
      glow: 'glow-orange'
    },
    { 
      label: 'Completed', 
      value: filteredProjects.filter(p => p.progress === 100).length.toString(), 
      icon: CheckCircle2, 
      gradient: 'btn-gradient-green',
      glow: 'glow-green'
    },
    { 
      label: 'Total Tasks', 
      value: filteredProjects.reduce((sum, p) => sum + (p.task_count || 0), 0).toString(), 
      icon: Target, 
      gradient: 'btn-gradient-purple',
      glow: 'glow-purple'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gradient mb-4">Project Portfolio</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Manage your project ecosystem with style and efficiency
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card neon-border-blue hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.gradient} ${stat.glow}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative flex-1 sm:flex-initial sm:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg input-neon text-white placeholder-slate-400 rounded-xl"
          />
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="btn-gradient-pink glow-pink text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="glass-card neon-border-purple text-center py-16">
          <CardContent>
            <div className="w-24 h-24 btn-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6 glow-purple">
              <FolderOpen className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for' 
                : 'Create your first project to get started with organized task management'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="btn-gradient-blue glow-cyan text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="glass-card neon-border-blue hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div 
                      className="p-3 rounded-xl"
                      style={getProjectColorStyle(project.color)}
                    >
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-xl group-hover:text-gradient transition-all duration-300 truncate">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {project.progress === 100 && (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white rounded-lg">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-dark border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => handleEditProject(project)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Progress</span>
                      <span className="text-white font-bold text-lg">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${project.progress || 0}%`,
                          backgroundColor: project.color || '#6366f1'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg glass-card">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-500">Tasks</p>
                        <p className="text-sm text-white font-medium">
                          {project.completed_task_count || 0}/{project.task_count || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg glass-card">
                      <div 
                        className="w-5 h-5 rounded-full"
                        style={getProjectColorStyle(project.color)}
                      />
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="text-sm text-white font-medium">
                          {project.progress === 100 ? 'Complete' : 
                           project.progress === 0 ? 'Not Started' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        onClick={() => setIsModalOpen(true)}
        size="lg"
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full btn-gradient-pink glow-pink shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="w-8 h-8" />
      </Button>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;

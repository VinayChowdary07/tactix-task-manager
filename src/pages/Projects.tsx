
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
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2
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

  // Mock progress data - in a real app, this would come from task completion rates
  const projectsWithProgress = projects.map(project => ({
    ...project,
    progress: Math.floor(Math.random() * 100),
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['active', 'completed', 'on-hold'][Math.floor(Math.random() * 3)],
    teamSize: Math.floor(Math.random() * 8) + 1,
    priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
  }));

  const filteredProjects = projectsWithProgress.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

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

  // Stats calculation
  const stats = [
    { 
      label: 'Total Projects', 
      value: projects.length.toString(), 
      icon: FolderOpen, 
      color: 'text-cyan-400' 
    },
    { 
      label: 'Active Projects', 
      value: filteredProjects.filter(p => p.status === 'active').length.toString(), 
      icon: Clock, 
      color: 'text-blue-400' 
    },
    { 
      label: 'Completed', 
      value: filteredProjects.filter(p => p.status === 'completed').length.toString(), 
      icon: CheckCircle2, 
      color: 'text-green-400' 
    },
    { 
      label: 'Team Members', 
      value: filteredProjects.reduce((sum, p) => sum + p.teamSize, 0).toString(), 
      icon: Users, 
      color: 'text-purple-400' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-dark border-slate-700/50 hover:glow-purple transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Project Portfolio</h2>
          <p className="text-slate-400">Manage your project ecosystem</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            />
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 glow-purple transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="glass-dark border-slate-700/50 text-center py-12">
          <CardContent>
            <FolderOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first project to get started with organized task management'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="glass-dark border-slate-700/50 hover:glow-purple transition-all transform hover:scale-105 cursor-pointer group overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r`} style={{ background: `linear-gradient(to right, ${project.color}, ${project.color}80)` }}></div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg`} style={{ backgroundColor: project.color }}>
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg group-hover:text-purple-400 transition-colors truncate">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {project.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
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
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all`}
                        style={{ 
                          width: `${project.progress}%`,
                          background: `linear-gradient(to right, ${project.color}, ${project.color}80)`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{project.teamSize} members</span>
                    </div>
                  </div>

                  {/* Priority and Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={`border ${getPriorityColor(project.priority)}`}>
                      <Star className="w-3 h-3 mr-1" />
                      {project.priority}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${
                        project.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                          : project.status === 'on-hold'
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      }`}
                    >
                      {project.status === 'completed' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

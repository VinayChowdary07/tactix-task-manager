
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  Plus, 
  Users, 
  Calendar,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: "TaskNova Mobile App",
      description: "Native mobile application for iOS and Android platforms",
      progress: 65,
      dueDate: "2024-02-15",
      status: "active",
      teamSize: 6,
      priority: "high",
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 2,
      name: "E-commerce Platform",
      description: "Full-stack e-commerce solution with payment integration",
      progress: 30,
      dueDate: "2024-03-01",
      status: "active",
      teamSize: 4,
      priority: "medium",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      name: "Data Analytics Dashboard",
      description: "Real-time analytics dashboard for business intelligence",
      progress: 90,
      dueDate: "2024-01-30",
      status: "active",
      teamSize: 3,
      priority: "high",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      name: "Marketing Website Redesign",
      description: "Complete redesign of company marketing website",
      progress: 100,
      dueDate: "2024-01-15",
      status: "completed",
      teamSize: 2,
      priority: "low",
      color: "from-orange-500 to-red-500"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const stats = [
    { label: 'Active Projects', value: '12', icon: FolderOpen, color: 'text-cyan-400' },
    { label: 'Completed', value: '8', icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Team Members', value: '24', icon: Users, color: 'text-purple-400' },
    { label: 'This Month', value: '3', icon: TrendingUp, color: 'text-pink-400' },
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Project Portfolio</h2>
          <p className="text-slate-400">Manage your project ecosystem</p>
        </div>
        
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 glow-purple transition-all transform hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="glass-dark border-slate-700/50 hover:glow-purple transition-all transform hover:scale-105 cursor-pointer group overflow-hidden"
          >
            <div className={`h-2 bg-gradient-to-r ${project.color}`}></div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${project.color}`}>
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg group-hover:text-purple-400 transition-colors">
                      {project.name}
                    </CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{project.description}</p>
                  </div>
                </div>
                {project.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
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
                      className={`h-2 rounded-full bg-gradient-to-r ${project.color} transition-all`}
                      style={{ width: `${project.progress}%` }}
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
    </div>
  );
};

export default Projects;

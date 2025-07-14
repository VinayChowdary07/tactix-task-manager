
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  FolderOpen, 
  Calendar, 
  Tag, 
  Settings, 
  LogOut, 
  Zap,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import ProjectModal from '@/components/ProjectModal';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, deleteProject } = useProjects();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will remove the project from all tasks.`)) {
      try {
        await deleteProject.mutateAsync(projectId);
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    navigate('/', { state: { selectedProjectId: projectId } });
  };

  const navItems = [
    { path: '/', icon: CheckSquare, label: 'Tasks', color: 'text-cyan-400' },
    { path: '/projects', icon: FolderOpen, label: 'Projects', color: 'text-purple-400' },
    { path: '/calendar', icon: Calendar, label: 'Calendar', color: 'text-pink-400' },
    { path: '/tags', icon: Tag, label: 'Tags', color: 'text-green-400' },
    { path: '/settings', icon: Settings, label: 'Settings', color: 'text-orange-400' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-slate-700/50 z-40 overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center glow-cyan">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TaskNova</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setSelectedProjectId(null);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                    active 
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 glow-cyan' 
                      : 'hover:bg-slate-800/50 hover:scale-105'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : item.color} group-hover:scale-110 transition-transform`} />
                  <span className={`font-medium ${active ? 'text-primary' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Projects Section */}
          <div className="border-t border-slate-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Projects</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsProjectModalOpen(true)}
                className="w-6 h-6 p-0 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedProjectId === project.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50'
                      : 'hover:bg-slate-800/50'
                  }`}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <span className="text-slate-300 text-sm truncate group-hover:text-white transition-colors">
                      {project.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, project.name);
                    }}
                    className="w-5 h-5 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {projects.length === 0 && (
                <div className="text-slate-500 text-sm py-4 text-center">
                  No projects yet
                </div>
              )}
            </div>
          </div>

          {/* User section */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="glass p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-8 h-8 ring-2 ring-primary/50">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-cyber text-white text-sm">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full bg-slate-800/50 border-slate-600 hover:bg-red-500/20 hover:border-red-500/50 text-slate-300 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        {/* Topbar */}
        <header className="glass-dark border-b border-slate-700/50 px-6 py-4 relative z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {selectedProjectId 
                  ? projects.find(p => p.id === selectedProjectId)?.name || 'Project Tasks'
                  : navItems.find(item => isActive(item.path))?.label || 'Dashboard'
                }
              </h1>
              <p className="text-slate-400 text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {selectedProjectId && (
                <Badge 
                  className="px-3 py-1"
                  style={{ 
                    backgroundColor: projects.find(p => p.id === selectedProjectId)?.color + '20',
                    color: projects.find(p => p.id === selectedProjectId)?.color,
                    border: `1px solid ${projects.find(p => p.id === selectedProjectId)?.color}40`
                  }}
                >
                  Filtered by Project
                </Badge>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-white">Welcome back!</p>
                <p className="text-xs text-slate-400">Ready to be productive?</p>
              </div>
              <Avatar className="w-10 h-10 ring-2 ring-primary/50 glow-cyan">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-cyber text-white">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 relative z-10">
          <Outlet context={{ selectedProjectId, projects }} />
        </main>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  CheckSquare,
  FolderOpen,
  Calendar,
  Target,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/hooks/useProjects';
import NotificationDropdown from './NotificationDropdown';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Tags', href: '/tags', icon: Tags },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    if (location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-slate-700/50"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full glass-dark border-r border-slate-700/50">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TaskFlow</h1>
                <p className="text-sm text-slate-400">Productivity Suite</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white glow-cyan'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* Projects Section */}
          <div className="p-4 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Projects</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-left ${
                  selectedProjectId === null
                    ? 'bg-slate-700/50 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
                onClick={() => handleProjectSelect(null)}
              >
                All Tasks
              </Button>
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-left ${
                    selectedProjectId === project.id
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  />
                  <span className="truncate">{project.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">Productivity Master</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden w-12" /> {/* Spacer for mobile menu button */}
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {navigation.find(nav => nav.href === location.pathname)?.name || 'Dashboard'}
                </h2>
                {selectedProjectId && (
                  <p className="text-sm text-slate-400">
                    Project: {projects.find(p => p.id === selectedProjectId)?.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationDropdown />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet context={{ selectedProjectId, projects }} />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

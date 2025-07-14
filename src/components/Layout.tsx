
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/hooks/useProjects';
import NotificationDropdown from './NotificationDropdown';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { projects } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, gradient: 'from-cyan-500 to-blue-500' },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, gradient: 'from-pink-500 to-rose-500' },
    { name: 'Goals', href: '/goals', icon: Target, gradient: 'from-purple-500 to-violet-500' },
    { name: 'Projects', href: '/projects', icon: FolderOpen, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, gradient: 'from-orange-500 to-amber-500' },
    { name: 'Tags', href: '/tags', icon: Tags, gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Settings', href: '/settings', icon: Settings, gradient: 'from-slate-500 to-gray-500' }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Context to pass to child routes
  const outletContext = {
    selectedProjectId,
    projects: projects || [],
    setSelectedProjectId
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-slate-700/50 glow-cyan"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full glass-dark border-r border-slate-700/30">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 btn-gradient-purple rounded-xl flex items-center justify-center glow-purple">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">TaskFlow</h1>
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
                  className={`w-full justify-start text-left transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/30 hover:scale-105'
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

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/30">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg glass-card">
              <div className="w-10 h-10 btn-gradient-blue rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">Productivity Master</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
        <div className="sticky top-0 z-30 glass-dark border-b border-slate-700/30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden w-12" />
              <div>
                <h2 className="text-xl font-bold text-gradient">
                  {navigation.find(nav => nav.href === location.pathname)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-slate-400">Welcome back! Ready to be productive?</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
              </Button>
              <NotificationDropdown />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 min-h-screen">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 modal-backdrop lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

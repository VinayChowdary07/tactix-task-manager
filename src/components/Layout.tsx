
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckSquare, 
  FolderOpen, 
  Calendar, 
  Tag, 
  Settings, 
  LogOut, 
  Zap,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
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
      <aside className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-slate-700/50 z-40">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center glow-cyan">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TaskNova</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
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
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

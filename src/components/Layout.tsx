
import React, { useState, useEffect } from 'react';
import {
  Home,
  CheckSquare,
  FolderOpen,
  Calendar,
  Settings,
  Target,
} from 'lucide-react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useProjects } from '@/hooks/useProjects';
import ProjectModal from './ProjectModal';
import { BarChart3 } from 'lucide-react';

const Layout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Extract project ID from URL if on the projects page
    if (location.pathname === '/projects') {
      const params = new URLSearchParams(location.search);
      const projectId = params.get('project');
      setSelectedProjectId(projectId);
    } else {
      setSelectedProjectId(null);
    }
  }, [location]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      console.log('Layout: Starting sign out process...');
      await signOut();
      // No need to handle redirect here - signOut function handles it
    } catch (error) {
      console.error('Layout: Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/weekly-review', icon: BarChart3, label: 'Weekly Review' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 py-6 px-3 flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center text-lg font-semibold text-white">
            TaskZen
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url as string} alt={user?.email as string} />
                  <AvatarFallback className="bg-slate-700 text-white">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2 bg-slate-800 border-slate-700">
              <DropdownMenuItem className="text-white" disabled>
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white hover:bg-slate-700">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignOut} 
                disabled={isSigningOut}
                className="text-red-400 focus:text-red-300 hover:bg-slate-700"
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex-1">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to} className="mb-1">
                  <Link
                    to={item.to}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200
                      ${isActive
                        ? 'text-white bg-slate-800 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-950">
        <Outlet context={{ selectedProjectId, projects, setSelectedProjectId }} />
      </main>

      {/* Project Modal */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      
      {/* Toaster */}
      <Toaster />
    </div>
  );
};

export default Layout;

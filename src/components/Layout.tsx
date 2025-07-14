import React, { useState, useEffect } from 'react';
import {
  Home,
  CheckSquare,
  FolderOpen,
  Calendar,
  Settings,
  Tag,
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

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/weekly-review', icon: BarChart3, label: 'Weekly Review' },
    { to: '/tags', icon: Tag, label: 'Tags' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-indigo-900 border-r border-r-slate-700/50 py-6 px-3 flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center text-lg font-semibold text-white">
            TaskZen
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url as string} alt={user?.email as string} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2 glass-dark border-slate-700/50">
              <DropdownMenuItem className="text-white">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
                Sign Out
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
                        ? 'text-white bg-slate-800/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/10'
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

        <div className="mt-auto">
          <Button
            variant="secondary"
            className="w-full btn-gradient-purple glow-purple text-white hover:scale-105 transition-all duration-300"
            onClick={() => setIsProjectModalOpen(true)}
          >
            New Project
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet context={{ selectedProjectId, projects, setSelectedProjectId }} />
      </main>

      {/* Project Modal */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
};

export default Layout;

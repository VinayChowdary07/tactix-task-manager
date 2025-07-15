
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ProductivityChart from '@/components/dashboard/ProductivityChart';
import GoalProgress from '@/components/dashboard/GoalProgress';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import { useGoals } from '@/hooks/useGoals';
import { 
  CheckCircle2, 
  Target, 
  FolderOpen, 
  Trophy, 
  Calendar,
  TrendingUp,
  Loader2
} from 'lucide-react';

const Index = () => {
  const { 
    stats, 
    recentActivity, 
    productivityData, 
    upcomingDeadlines, 
    isLoading 
  } = useDashboard();
  const { goals } = useGoals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Your productivity at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Tasks Completed Today</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.tasksToday}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-blue-400">{stats.projectsActive}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Goals In Progress</p>
                <p className="text-2xl font-bold text-purple-400">{stats.goalsInProgress}</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Goals Achieved This Week</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.goalsAchievedThisWeek}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Tasks Completed</p>
                <p className="text-2xl font-bold text-green-400">{stats.tasksCompleted}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Projects Completed</p>
                <p className="text-2xl font-bold text-orange-400">{stats.projectsCompleted}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Goals Achieved</p>
                <p className="text-2xl font-bold text-pink-400">{stats.goalsAchieved}</p>
              </div>
              <Trophy className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <ProductivityChart data={productivityData} />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <GoalProgress goals={goals} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <ActivityFeed activities={recentActivity} />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <UpcomingDeadlines tasks={upcomingDeadlines} />
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/tasks" 
              className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 group"
            >
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Add New Task</h3>
              <p className="text-slate-400 text-sm">Create and organize your tasks</p>
            </a>
            <a 
              href="/projects" 
              className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 group"
            >
              <FolderOpen className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">New Project</h3>
              <p className="text-slate-400 text-sm">Start a new project</p>
            </a>
            <a 
              href="/goals" 
              className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 group"
            >
              <Target className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Set New Goal</h3>
              <p className="text-slate-400 text-sm">Define your objectives</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

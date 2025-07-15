
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
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 btn-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gradient-blue mb-4">
          Welcome to TaskZen
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Your productivity at a glance - track tasks, projects, and goals all in one place
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tasks Completed Today"
          value={stats.tasksToday}
          icon={CheckCircle2}
          gradient="btn-gradient-green"
          glow="glow-green"
        />
        <StatsCard
          title="Active Projects"
          value={stats.projectsActive}
          icon={FolderOpen}
          gradient="btn-gradient-blue"
          glow="glow-cyan"
        />
        <StatsCard
          title="Goals In Progress"
          value={stats.goalsInProgress}
          icon={Target}
          gradient="btn-gradient-purple"
          glow="glow-purple"
        />
        <StatsCard
          title="Goals Achieved This Week"
          value={stats.goalsAchievedThisWeek}
          icon={Trophy}
          gradient="btn-gradient-pink"
          glow="glow-pink"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Tasks Completed"
          value={stats.tasksCompleted}
          icon={CheckCircle2}
          gradient="btn-gradient-green"
          glow="glow-green"
        />
        <StatsCard
          title="Projects Completed"
          value={stats.projectsCompleted}
          icon={FolderOpen}
          gradient="btn-gradient-orange"
          glow="glow-orange"
        />
        <StatsCard
          title="Total Goals Achieved"
          value={stats.goalsAchieved}
          icon={Trophy}
          gradient="btn-gradient-pink"
          glow="glow-pink"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <ProductivityChart data={productivityData} />
          <GoalProgress goals={goals} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <ActivityFeed activities={recentActivity} />
          <UpcomingDeadlines tasks={upcomingDeadlines} />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-slate-800/50 to-indigo-800/50 rounded-xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/tasks" 
            className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-600/50 group"
          >
            <CheckCircle2 className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Add New Task</h3>
            <p className="text-slate-400 text-sm">Create and organize your tasks</p>
          </a>
          <a 
            href="/projects" 
            className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-600/50 group"
          >
            <FolderOpen className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">New Project</h3>
            <p className="text-slate-400 text-sm">Start a new project</p>
          </a>
          <a 
            href="/goals" 
            className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-600/50 group"
          >
            <Target className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Set New Goal</h3>
            <p className="text-slate-400 text-sm">Define your objectives</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;

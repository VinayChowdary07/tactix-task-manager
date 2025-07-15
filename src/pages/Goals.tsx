
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Target, 
  Search, 
  Filter, 
  SortAsc,
  Trophy,
  TrendingUp,
  Users,
  User,
  Repeat,
  Calendar,
  Tag
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoals, Goal } from '@/hooks/useGoals';
import GoalModal from '@/components/GoalModal';
import GoalCard from '@/components/GoalCard';

const Goals = () => {
  const { goals, isLoading, deleteGoal, markGoalComplete } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'target_date' | 'name' | 'created_at'>('created_at');

  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           goal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           goal.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || goal.goal_type === filterType;
      const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          const progressA = calculateProgress(a);
          const progressB = calculateProgress(b);
          return progressB - progressA;
        case 'target_date':
          if (!a.target_date && !b.target_date) return 0;
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [goals, searchTerm, filterType, filterStatus, sortBy]);

  const calculateProgress = (goal: Goal) => {
    if (!goal.goal_tasks?.length && !goal.goal_milestones?.length) return 0;
    
    const taskProgress = goal.goal_tasks?.length ? 
      (goal.goal_tasks.filter(gt => gt.tasks.status === 'Done').length / goal.goal_tasks.length) * 50 : 0;
    
    const milestoneProgress = goal.goal_milestones?.length ?
      (goal.goal_milestones.filter(m => m.completed).length / goal.goal_milestones.length) * 50 : 0;
    
    return Math.round(taskProgress + milestoneProgress);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await markGoalComplete.mutateAsync(id);
    } catch (error) {
      console.error('Error marking goal complete:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const getStatsCards = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const avgProgress = totalGoals > 0 ? 
      Math.round(goals.reduce((sum, goal) => sum + calculateProgress(goal), 0) / totalGoals) : 0;

    return [
      { label: 'Total Goals', value: totalGoals, icon: Target, color: 'text-cyan-400' },
      { label: 'Active Goals', value: activeGoals, icon: TrendingUp, color: 'text-blue-400' },
      { label: 'Completed', value: completedGoals, icon: Trophy, color: 'text-yellow-400' },
      { label: 'Avg Progress', value: `${avgProgress}%`, icon: Calendar, color: 'text-green-400' },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Goals Dashboard</h1>
            <p className="text-slate-400">Track your progress and achieve your objectives</p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {getStatsCards().map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search goals, tags, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team
                  </div>
                </SelectItem>
                <SelectItem value="recurring">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Recurring
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="target_date">Target Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredAndSortedGoals.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'No goals found' : 'No goals yet'}
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Create your first goal to start tracking your progress and achieving your objectives.'
              }
            </p>
            {(!searchTerm && filterType === 'all' && filterStatus === 'all') && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Goal
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onMarkComplete={handleMarkComplete}
              />
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-2xl hover:shadow-cyan-500/25 hover:scale-110 transition-all z-50"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Goal Modal */}
        <GoalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          goal={editingGoal}
        />
      </div>
    </div>
  );
};

export default Goals;

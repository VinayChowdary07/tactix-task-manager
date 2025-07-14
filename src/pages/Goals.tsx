
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';
import GoalModal from '@/components/GoalModal';
import { format } from 'date-fns';

const Goals = () => {
  const { goals, isLoading, deleteGoal } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [sortBy, setSortBy] = useState<'progress' | 'target_date' | 'name'>('progress');

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          const progressA = a.goal_tasks?.length ? 
            (a.goal_tasks.filter(gt => gt.tasks.status === 'Done').length / a.goal_tasks.length) * 100 : 0;
          const progressB = b.goal_tasks?.length ? 
            (b.goal_tasks.filter(gt => gt.tasks.status === 'Done').length / b.goal_tasks.length) * 100 : 0;
          return progressB - progressA;
        case 'target_date':
          if (!a.target_date && !b.target_date) return 0;
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [goals, sortBy]);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.goal_tasks?.length) return 0;
    const completedTasks = goal.goal_tasks.filter(gt => gt.tasks.status === 'Done').length;
    return (completedTasks / goal.goal_tasks.length) * 100;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    if (progress >= 25) return 'from-blue-500 to-cyan-500';
    return 'from-red-500 to-rose-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Goals</h1>
          <p className="text-slate-400">Track your progress and achieve your objectives</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'progress' | 'target_date' | 'name')}
            className="bg-slate-800/50 border border-slate-600 text-white px-3 py-2 rounded-lg focus:border-cyan-400 focus:ring-cyan-400/20"
          >
            <option value="progress">Sort by Progress</option>
            <option value="target_date">Sort by Target Date</option>
            <option value="name">Sort by Name</option>
          </select>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      {sortedGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-slate-400 mb-4">Create your first goal to start tracking your progress</p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const taskCount = goal.goal_tasks?.length || 0;
            const completedTasks = goal.goal_tasks?.filter(gt => gt.tasks.status === 'Done').length || 0;
            
            return (
              <Card
                key={goal.id}
                className="glass-dark border-slate-700/50 hover:glow-cyan transition-all transform hover:scale-105 cursor-pointer group"
                onClick={() => handleEditGoal(goal)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-5 h-5 ${progress === 100 ? 'text-yellow-400' : 'text-slate-500'}`} />
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Progress</span>
                      <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                    </div>
                    
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500 rounded-full`}
                        style={{ width: `${progress}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{completedTasks}</div>
                      <div className="text-xs text-slate-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{taskCount}</div>
                      <div className="text-xs text-slate-500">Total Tasks</div>
                    </div>
                  </div>

                  {/* Target Date */}
                  {goal.target_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-500">
                      {progress === 100 ? 'Goal Completed!' : 
                       progress >= 75 ? 'Almost there!' :
                       progress >= 50 ? 'Good progress' :
                       progress >= 25 ? 'Getting started' : 'Just beginning'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        onClick={() => setIsModalOpen(true)}
        size="lg"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-cyber glow-cyan shadow-2xl hover:scale-110 transition-all z-50"
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
  );
};

export default Goals;

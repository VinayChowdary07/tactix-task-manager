
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { CalendarDays, Target, Clock, TrendingUp, Star, CheckCircle2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, addWeeks } from 'date-fns';

const WeeklyReview = () => {
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  const currentWeek = useMemo(() => {
    const today = new Date();
    const targetDate = addWeeks(today, selectedWeekOffset);
    return {
      start: startOfWeek(targetDate, { weekStartsOn: 1 }),
      end: endOfWeek(targetDate, { weekStartsOn: 1 })
    };
  }, [selectedWeekOffset]);

  const weeklyStats = useMemo(() => {
    const weekTasks = tasks.filter(task => 
      task.created_at && isWithinInterval(new Date(task.created_at), currentWeek)
    );

    const completedTasks = weekTasks.filter(task => task.status === 'Done');
    const totalTimeSpent = weekTasks.reduce((sum, task) => sum + (task.time_spent || 0), 0);
    const totalTimeEstimated = weekTasks.reduce((sum, task) => sum + (task.time_estimate || 0), 0);

    // Priority breakdown
    const priorityBreakdown = {
      Low: completedTasks.filter(t => t.priority === 'Low').length,
      Medium: completedTasks.filter(t => t.priority === 'Medium').length,
      High: completedTasks.filter(t => t.priority === 'High').length,
      Critical: completedTasks.filter(t => t.priority === 'Critical').length,
    };

    // Tag breakdown
    const tagBreakdown = completedTasks.reduce((acc, task) => {
      task.tags?.forEach(tag => {
        acc[tag.name] = (acc[tag.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Productivity score (completion rate + time accuracy)
    const completionRate = weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0;
    const timeAccuracy = totalTimeEstimated > 0 ? Math.max(0, 100 - Math.abs(totalTimeSpent - totalTimeEstimated) / totalTimeEstimated * 100) : 100;
    const productivityScore = Math.round((completionRate + timeAccuracy) / 2);

    return {
      totalTasks: weekTasks.length,
      completedTasks: completedTasks.length,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
      totalTimeEstimated: Math.round(totalTimeEstimated / 60),
      priorityBreakdown,
      tagBreakdown,
      productivityScore,
      completionRate: Math.round(completionRate)
    };
  }, [tasks, currentWeek]);

  const weekOptions = Array.from({ length: 8 }, (_, i) => {
    const offset = i - 4;
    const weekStart = startOfWeek(addWeeks(new Date(), offset), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(addWeeks(new Date(), offset), { weekStartsOn: 1 });
    
    return {
      value: offset,
      label: offset === 0 
        ? 'This Week' 
        : offset === -1 
          ? 'Last Week'
          : `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`
    };
  });

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gradient-purple mb-4">Weekly Review</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Track your productivity and celebrate your achievements
        </p>
      </div>

      {/* Week Selector */}
      <div className="flex justify-center">
        <Select 
          value={selectedWeekOffset.toString()} 
          onValueChange={(value) => setSelectedWeekOffset(parseInt(value))}
        >
          <SelectTrigger className="w-64 bg-slate-800/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {weekOptions.map(option => (
              <SelectItem key={option.value} value={option.value.toString()} className="text-white">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card neon-border-blue hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {weeklyStats.completedTasks}/{weeklyStats.totalTasks}
                </p>
              </div>
              <div className="p-4 rounded-xl btn-gradient-blue glow-cyan">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border-green hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Hours Tracked</p>
                <p className="text-3xl font-bold text-white mt-2">{weeklyStats.totalTimeSpent}h</p>
                {weeklyStats.totalTimeEstimated > 0 && (
                  <p className="text-xs text-slate-500">Est: {weeklyStats.totalTimeEstimated}h</p>
                )}
              </div>
              <div className="p-4 rounded-xl btn-gradient-green glow-green">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border-purple hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-white mt-2">{weeklyStats.completionRate}%</p>
              </div>
              <div className="p-4 rounded-xl btn-gradient-purple glow-purple">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border-pink hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Productivity Score</p>
                <p className="text-3xl font-bold text-white mt-2">{weeklyStats.productivityScore}</p>
              </div>
              <div className="p-4 rounded-xl btn-gradient-pink glow-pink">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card className="glass-card neon-border-orange">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(weeklyStats.priorityBreakdown).map(([priority, count]) => {
                const colors = {
                  Low: 'bg-green-500',
                  Medium: 'bg-yellow-500',
                  High: 'bg-red-500',
                  Critical: 'bg-red-600'
                };
                const percentage = weeklyStats.completedTasks > 0 ? (count / weeklyStats.completedTasks) * 100 : 0;
                
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{priority}</span>
                      <span className="text-slate-400">{count} tasks</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[priority as keyof typeof colors]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tag Breakdown */}
        <Card className="glass-card neon-border-cyan">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-cyan-400" />
              Top Tags This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(weeklyStats.tagBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([tag, count]) => {
                  const percentage = weeklyStats.completedTasks > 0 ? (count / weeklyStats.completedTasks) * 100 : 0;
                  
                  return (
                    <div key={tag} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{tag}</span>
                        <span className="text-slate-400">{count} tasks</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(weeklyStats.tagBreakdown).length === 0 && (
                <p className="text-slate-400 text-center py-4">No tags used this week</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Insights */}
      <Card className="glass-card neon-border-gradient">
        <CardHeader>
          <CardTitle className="text-white text-center">Weekly Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">
                {weeklyStats.completionRate >= 80 ? '🎉' : weeklyStats.completionRate >= 60 ? '👍' : '💪'}
              </div>
              <p className="text-slate-300">
                {weeklyStats.completionRate >= 80 
                  ? 'Excellent completion rate!' 
                  : weeklyStats.completionRate >= 60 
                    ? 'Good progress this week' 
                    : 'Room for improvement'
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">
                {Math.abs(weeklyStats.totalTimeSpent - weeklyStats.totalTimeEstimated) <= 2 ? '🎯' : '⏰'}
              </div>
              <p className="text-slate-300">
                {Math.abs(weeklyStats.totalTimeSpent - weeklyStats.totalTimeEstimated) <= 2
                  ? 'Great time estimation!'
                  : 'Work on time estimates'
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-400">
                {weeklyStats.productivityScore >= 80 ? '⭐' : weeklyStats.productivityScore >= 60 ? '🔥' : '🚀'}
              </div>
              <p className="text-slate-300">
                Productivity Score: {weeklyStats.productivityScore}/100
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReview;

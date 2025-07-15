
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/hooks/useGoals';
import { Trophy, Target, Clock } from 'lucide-react';

interface GoalProgressProps {
  goals: Goal[];
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 5);

  const getGoalProgress = (goal: Goal) => {
    if (!goal.goal_tasks || goal.goal_tasks.length === 0) return 0;
    const completedTasks = goal.goal_tasks.filter(gt => gt.tasks.status === 'Done').length;
    return Math.round((completedTasks / goal.goal_tasks.length) * 100);
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-blue-400';
  };

  if (activeGoals.length === 0) {
    return (
      <Card className="glass-card neon-border-pink">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No active goals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card neon-border-pink">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <h4 className="text-white font-medium truncate">{goal.title}</h4>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(progress)}`}>
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                {goal.target_date && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Due {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalProgress;

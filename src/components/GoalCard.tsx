
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Tag,
  Clock,
  Users,
  User,
  Repeat,
  Milestone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Goal } from '@/hooks/useGoals';
import { format } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onMarkComplete }) => {
  const calculateProgress = () => {
    if (!goal.goal_tasks?.length && !goal.goal_milestones?.length) return 0;
    
    const taskProgress = goal.goal_tasks?.length ? 
      (goal.goal_tasks.filter(gt => gt.tasks.status === 'Done').length / goal.goal_tasks.length) * 50 : 0;
    
    const milestoneProgress = goal.goal_milestones?.length ?
      (goal.goal_milestones.filter(m => m.completed).length / goal.goal_milestones.length) * 50 : 0;
    
    return Math.round(taskProgress + milestoneProgress);
  };

  const progress = calculateProgress();
  const isCompleted = goal.status === 'completed';
  const isPaused = goal.status === 'paused';
  
  const getStatusIcon = () => {
    switch (goal.goal_type) {
      case 'team': return <Users className="w-4 h-4" />;
      case 'recurring': return <Repeat className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-green-400';
    if (isPaused) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <Card 
      className="group relative bg-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-[1.02] overflow-hidden"
      style={{ borderColor: `${goal.color}20` }}
    >
      {/* Color accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: goal.color }}
      />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: goal.color }}
            />
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                {goal.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${getStatusColor()}`}>
                  {getStatusIcon()}
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  {goal.goal_type}
                </span>
                {goal.status !== 'active' && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isCompleted ? 'bg-green-900/30 text-green-400' : 
                    isPaused ? 'bg-yellow-900/30 text-yellow-400' : 
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {goal.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem onClick={() => onEdit(goal)} className="text-white hover:bg-slate-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Goal
              </DropdownMenuItem>
              {!isCompleted && (
                <DropdownMenuItem onClick={() => onMarkComplete(goal.id)} className="text-green-400 hover:bg-slate-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-400 hover:bg-slate-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {goal.description}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-white">{progress}%</span>
          </div>
          
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: goal.color,
                boxShadow: `0 0 10px ${goal.color}40`
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: goal.color }}>
              {goal.goal_tasks?.filter(gt => gt.tasks.status === 'Done').length || 0}
            </div>
            <div className="text-xs text-slate-500">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">
              {goal.goal_milestones?.filter(m => m.completed).length || 0}
            </div>
            <div className="text-xs text-slate-500">Milestones</div>
          </div>
        </div>

        {/* Tags */}
        {goal.tags && goal.tags.length > 0 && (
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            <Tag className="w-3 h-3 text-slate-500" />
            {goal.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {goal.tags.length > 3 && (
              <span className="text-xs text-slate-500">+{goal.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="space-y-2">
          {goal.start_date && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Started: {format(new Date(goal.start_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
          {goal.target_date && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Achievement indicator */}
        {isCompleted && (
          <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalCard;

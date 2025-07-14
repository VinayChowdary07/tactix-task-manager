
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { Edit, Trash2, Calendar, Flag, Clock, AlertTriangle, Tag } from 'lucide-react';
import { format, isToday, isBefore, startOfDay, parseISO, addDays } from 'date-fns';

interface TaskCardProps {
  task: Task;
  projects: Array<{ id: string; name: string; color?: string }>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projects, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600/20 text-red-300 border-red-600/50 glow-red';
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Todo': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getDueDateInfo = () => {
    if (!task.due_date) return null;
    
    const dueDate = parseISO(task.due_date);
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    
    if (task.status === 'Done') {
      return {
        label: 'Completed',
        color: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: Clock
      };
    }
    
    if (isBefore(dueDate, today)) {
      return {
        label: 'Overdue',
        color: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse',
        icon: AlertTriangle
      };
    }
    
    if (isToday(dueDate)) {
      return {
        label: 'Due Today',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 glow-yellow',
        icon: Clock
      };
    }
    
    if (isBefore(dueDate, tomorrow)) {
      return {
        label: 'Due Tomorrow',
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
        icon: Clock
      };
    }
    
    return {
      label: format(dueDate, 'MMM dd, yyyy'),
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      icon: Calendar
    };
  };

  const getProgressPercentage = () => {
    switch (task.status) {
      case 'Done': return 100;
      case 'In Progress': return 60;
      case 'Todo': return 20;
      default: return 0;
    }
  };

  const project = projects.find(p => p.id === task.project_id);
  const dueDateInfo = getDueDateInfo();

  return (
    <Card className="glass-dark border-slate-700/50 hover:glow-cyan transition-all transform hover:scale-105 cursor-pointer group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors truncate">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex space-x-1 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="w-8 h-8 p-0 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="w-8 h-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Project Badge */}
          {project && (
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color || '#6366f1' }}
              />
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: `${project.color || '#6366f1'}20`,
                  color: project.color || '#6366f1',
                  borderColor: `${project.color || '#6366f1'}40`
                }}
              >
                {project.name}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className="text-xs px-2 py-1 border"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: `${tag.color}40`
                  }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Due Date Badge */}
          {dueDateInfo && (
            <div className="flex items-center space-x-2">
              <Badge className={`border text-xs ${dueDateInfo.color}`}>
                <dueDateInfo.icon className="w-3 h-3 mr-1" />
                {dueDateInfo.label}
              </Badge>
            </div>
          )}

          {/* Priority and Status */}
          <div className="flex items-center justify-between">
            <Badge className={`border ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
            <Badge variant="outline" className={`${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;

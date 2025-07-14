
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { Edit, Trash2, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  projects: Array<{ id: string; name: string; color?: string }>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projects, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getProgressPercentage = () => {
    switch (task.status) {
      case 'Done': return 100;
      case 'In Progress': return 60;
      case 'Todo': return 20;
      default: return 0;
    }
  };

  const project = projects.find(p => p.id === task.project_id);

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
                onClick={() => onEdit(task)}
                className="w-8 h-8 p-0 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(task.id)}
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

          {/* Due date */}
          {task.due_date && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
            </div>
          )}

          {/* Status and Priority */}
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

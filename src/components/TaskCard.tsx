
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Task } from '@/hooks/useTasks';
import { 
  Calendar, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Todo': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Todo': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'Done': return 100;
      case 'In Progress': return 50;
      case 'Todo': return 0;
      default: return 0;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'In Progress': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Todo': return 'bg-gradient-to-r from-orange-500 to-yellow-500';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-400';
    }
  };

  return (
    <Card className="glass-dark border-slate-700/50 hover:glow-cyan transition-all transform hover:scale-105 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-white text-lg group-hover:text-cyan-400 transition-colors">
            {task.title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 h-auto text-slate-400 hover:text-cyan-400"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 h-auto text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        {task.description && (
          <p className="text-slate-400 text-sm mt-2">{task.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">{getProgressValue(task.status)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(task.status)}`}
                style={{ width: `${getProgressValue(task.status)}%` }}
              />
            </div>
          </div>

          {/* Due Date and Priority */}
          <div className="flex items-center justify-between">
            {task.due_date && (
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex space-x-2">
              <Badge className={`border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
              <Badge className={`border ${getStatusColor(task.status)}`}>
                {task.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;

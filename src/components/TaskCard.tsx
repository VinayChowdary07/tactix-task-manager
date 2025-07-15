
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, Calendar, Flag } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import TaskTimer from './TaskTimer';
import { Repeat } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Todo' | 'In Progress' | 'Done';
    project_id?: string;
    repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    time_estimate?: number;
    time_spent?: number;
  };
  projects: Array<Project>;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projects, onEdit, onDelete }) => {
  const project = projects.find(p => p.id === task.project_id);

  const priorityConfig = {
    Low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    Critical: { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' },
  };

  const statusConfig = {
    Todo: { border: 'border-cyan-400/50', color: 'text-blue-400' },
    'In Progress': { border: 'border-orange-400/50', color: 'text-orange-400' },
    Done: { border: 'border-green-400/50', color: 'text-green-400' },
  };

  const priorityStyle = priorityConfig[task.priority];
  const statusStyle = statusConfig[task.status];

  return (
    <Card className={`bg-slate-900/50 backdrop-blur-xl border ${statusStyle.border} hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer animate-fade-in rounded-xl`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-semibold text-lg truncate group-hover:text-cyan-400 transition-colors">
                  {task.title}
                </h3>
                {task.repeat_type && task.repeat_type !== 'none' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                    <Repeat className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium capitalize">
                      {task.repeat_type}
                    </span>
                  </div>
                )}
              </div>
              
              {task.description && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-white" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl">
                <DropdownMenuItem 
                  onClick={() => onEdit(task)} 
                  className="hover:bg-slate-700/50 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Edit Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)} 
                  className="hover:bg-red-700/50 text-red-400 hover:text-red-300 cursor-pointer focus:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete Task</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Timer Component */}
          <TaskTimer 
            taskId={task.id} 
            timeEstimate={task.time_estimate}
            timeSpent={task.time_spent}
          />

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">
                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Project and Priority Row */}
          <div className="flex items-center justify-between">
            {project && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />
                <span className="text-slate-400 text-sm">{project.name}</span>
              </div>
            )}
            
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.border} border`}>
              <Flag className={`w-3 h-3 ${priorityStyle.color}`} />
              <span className={`text-xs font-medium ${priorityStyle.color}`}>
                {task.priority}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/50 border ${statusStyle.border}`}>
              <div className={`w-2 h-2 rounded-full ${statusStyle.color.replace('text-', 'bg-')}`} />
              <span className={`text-sm font-medium ${statusStyle.color}`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;

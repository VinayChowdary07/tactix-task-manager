
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import TaskTimer from './TaskTimer';
import { Repeat } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Todo' | 'In Progress' | 'Done';
    project_id?: string;
    tags?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
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

  const priorityColors = {
    Low: 'text-green-400',
    Medium: 'text-yellow-400',
    High: 'text-red-400',
    Critical: 'text-red-600 font-bold',
  };

  const borderColor = {
    Todo: 'neon-border-blue',
    'In Progress': 'neon-border-orange',
    Done: 'neon-border-green',
  }[task.status] || 'neon-border-blue';

  const tagColors = {
    Low: 'bg-green-500/10 text-green-400',
    Medium: 'bg-yellow-500/10 text-yellow-400',
    High: 'bg-red-500/10 text-red-400',
    Critical: 'bg-red-600/10 text-red-600',
  };

  return (
    <Card className={`glass-card hover:scale-105 transition-all duration-300 ${borderColor} animate-fade-in`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-semibold text-lg truncate">{task.title}</h3>
                {task.repeat_type && task.repeat_type !== 'none' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                    <Repeat className="w-3 h-3 text-purple-400 animate-pulse" />
                    <span className="text-xs text-purple-400 font-medium">
                      {task.repeat_type}
                    </span>
                  </div>
                )}
              </div>
              {task.description && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{task.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-700/20">
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 glass-card border-slate-700/50">
                <DropdownMenuItem onClick={() => onEdit(task)} className="hover:bg-slate-700/50 text-slate-300">
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Edit Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="hover:bg-red-700/50 text-red-400 focus:text-red-400">
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

          {/* Project and Priority */}
          <div className="flex items-center justify-between text-sm">
            {project && (
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />
                <span className="text-slate-400">{project.name}</span>
              </div>
            )}
            <span className={`font-medium ${priorityColors[task.priority]}`}>
              {task.priority} Priority
            </span>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {task.tags.map((tag) => (
                <Badge key={tag.id} className={`bg-transparent border border-slate-600 rounded-full px-2 py-0.5 text-xs ${tagColors[task.priority]}`}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;

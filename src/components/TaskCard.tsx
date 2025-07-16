
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, Calendar, Flag, RotateCw, CheckSquare, ExternalLink } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  projects: Array<Project>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  projects, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onViewDetails 
}) => {
  const project = projects.find(p => p.id === task.project_id);

  const priorityConfig = {
    Low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    Critical: { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' },
  };

  const statusConfig = {
    Todo: { border: 'border-slate-700/50', color: 'text-slate-400' },
    'In Progress': { border: 'border-orange-400/50', color: 'text-orange-400' },
    Done: { border: 'border-green-400/50', color: 'text-green-400' },
  };

  const priorityStyle = priorityConfig[task.priority];
  const statusStyle = statusConfig[task.status];

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleToggleComplete = (checked: boolean | string) => {
    if (onToggleComplete) {
      onToggleComplete({
        ...task,
        completed: typeof checked === 'boolean' ? checked : !task.completed,
        status: (typeof checked === 'boolean' ? checked : !task.completed) ? 'Done' : 'Todo'
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('[role="checkbox"]') || 
      target.closest('.checkbox-container') ||
      (target instanceof HTMLInputElement && target.type === 'checkbox')
    ) {
      return;
    }
    
    if (onViewDetails) {
      onViewDetails(task);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className={`bg-slate-900/50 backdrop-blur-xl border hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer animate-fade-in rounded-xl ${task.completed ? 'opacity-75' : ''} relative overflow-hidden`}
      onClick={handleCardClick}
    >
      {/* Task Color Strip */}
      {task.color && (
        <div 
          className="absolute top-0 left-0 right-0 h-1 z-10"
          style={{ backgroundColor: task.color }}
        />
      )}
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Checkbox, Title and Actions */}
          <div className="flex items-start gap-3">
            {onToggleComplete && (
              <div className="checkbox-container" onClick={handleCheckboxClick}>
                <Checkbox
                  checked={task.completed || false}
                  onCheckedChange={handleToggleComplete}
                  className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  {task.color && (
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.color }}
                    />
                  )}
                  <h3 className={`font-semibold text-lg truncate group-hover:text-cyan-400 transition-colors ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </h3>
                </div>
                
                {/* View Details Icon */}
                <div className="flex items-center gap-1">
                  {onViewDetails && (
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  )}
                  
                  <div onClick={handleDropdownClick}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }} 
                          className="hover:bg-slate-700/50 text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          <span>Edit Task</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                          }} 
                          className="hover:bg-red-700/50 text-red-400 hover:text-red-300 cursor-pointer focus:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete Task</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {task.description && (
                <p className={`text-sm line-clamp-2 mb-3 leading-relaxed ${task.completed ? 'text-slate-500' : 'text-slate-400'}`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span className={task.completed ? 'text-slate-500' : 'text-slate-400'}>
                Subtasks: {completedSubtasks}/{totalSubtasks} completed
              </span>
              <div className="flex-1 bg-slate-700 rounded-full h-2 ml-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: totalSubtasks > 0 ? `${(completedSubtasks / totalSubtasks) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-sm">
            {task.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className={task.completed ? 'text-slate-500' : 'text-slate-400'}>
                  Start: {format(new Date(task.start_date), 'MMM d')}
                </span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className={task.completed ? 'text-slate-500' : 'text-slate-400'}>
                  Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Project, Priority and Recurring Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {project && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  />
                  <span className={`text-sm ${task.completed ? 'text-slate-500' : 'text-slate-400'}`}>
                    {project.name}
                  </span>
                </div>
              )}
              
              {(task.recurring || task.is_recurring_parent || task.parent_recurring_task_id) && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <RotateCw className="w-3 h-3" />
                  <span>Recurring</span>
                </div>
              )}
            </div>
            
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

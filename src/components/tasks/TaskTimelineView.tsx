
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { format, differenceInDays, parseISO } from 'date-fns';

interface TaskTimelineViewProps {
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({ 
  tasks, 
  projects, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}) => {
  // Filter tasks that have both start and due dates
  const timelineTasks = tasks.filter(task => task.start_date && task.due_date);

  if (timelineTasks.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
        <p className="text-slate-400 mb-2">No tasks with start and due dates</p>
        <p className="text-slate-500 text-sm">Add start and due dates to tasks to see them in timeline view</p>
      </div>
    );
  }

  // Find the earliest start date and latest due date
  const allDates = timelineTasks.flatMap(task => [
    parseISO(task.start_date!),
    parseISO(task.due_date!)
  ]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  const getTaskPosition = (task: Task) => {
    const startDate = parseISO(task.start_date!);
    const endDate = parseISO(task.due_date!);
    const daysFromStart = differenceInDays(startDate, minDate);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: (daysFromStart / totalDays) * 100,
      width: (duration / totalDays) * 100
    };
  };

  const getTaskColor = (task: Task) => {
    switch (task.priority) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-red-400';
      case 'Medium': return 'bg-yellow-400';
      case 'Low': return 'bg-green-400';
      default: return 'bg-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'border-green-400';
      case 'In Progress': return 'border-orange-400';
      default: return 'border-slate-600';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Task Timeline</h3>
        <p className="text-slate-400">
          {format(minDate, 'MMM d, yyyy')} - {format(maxDate, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Timeline Header */}
      <div className="relative mb-4 h-8 bg-slate-800/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.min(totalDays, 30) }, (_, i) => {
            const date = new Date(minDate);
            date.setDate(date.getDate() + Math.floor((i / 30) * totalDays));
            return (
              <div
                key={i}
                className="flex-1 border-r border-slate-700/50 px-2 py-1 text-xs text-slate-400"
                style={{ minWidth: '60px' }}
              >
                {format(date, 'MMM d')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {timelineTasks.map((task, index) => {
          const position = getTaskPosition(task);
          const project = projects.find(p => p.id === task.project_id);
          
          return (
            <div key={task.id} className="relative">
              {/* Task Label */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <span className="text-white font-medium truncate">{task.title}</span>
                {project && (
                  <span className="text-xs text-slate-400">({project.name})</span>
                )}
              </div>
              
              {/* Timeline Bar */}
              <div className="relative h-8 bg-slate-800/20 rounded-lg mb-2">
                <div
                  className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all hover:opacity-80 border-2 ${getTaskColor(task)} ${getStatusColor(task.status)} ${task.completed ? 'opacity-50' : ''}`}
                  style={{
                    left: `${position.left}%`,
                    width: `${Math.max(position.width, 2)}%`
                  }}
                  onClick={() => onEdit(task)}
                  title={`${task.title} (${format(parseISO(task.start_date!), 'MMM d')} - ${format(parseISO(task.due_date!), 'MMM d')})`}
                >
                  <div className="px-2 py-1 text-xs text-white font-medium truncate">
                    {task.title}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-slate-400">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-slate-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-slate-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="text-slate-400">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimelineView;

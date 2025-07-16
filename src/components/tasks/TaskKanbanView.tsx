
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskCard from '@/components/TaskCard';

interface TaskKanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  onView: (task: Task) => void;
}

const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({ 
  tasks, 
  projects, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onView 
}) => {
  const columns = [
    { id: 'Todo', title: 'To Do', color: 'border-slate-600' },
    { id: 'In Progress', title: 'In Progress', color: 'border-orange-400/50' },
    { id: 'Done', title: 'Done', color: 'border-green-400/50' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div key={column.id} className={`bg-slate-900/50 backdrop-blur-xl rounded-xl border ${column.color} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg">{column.title}</h3>
              <span className="bg-slate-700/50 text-slate-300 text-sm px-2 py-1 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="space-y-4 min-h-[200px]">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleComplete={onToggleComplete}
                />
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanbanView;

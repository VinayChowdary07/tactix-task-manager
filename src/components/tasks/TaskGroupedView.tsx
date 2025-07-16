
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskCard from '@/components/TaskCard';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TaskGroupedViewProps {
  tasks: Task[];
  projects: Project[];
  groupBy: 'status' | 'project' | 'priority';
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  onView: (task: Task) => void;
}

const TaskGroupedView: React.FC<TaskGroupedViewProps> = ({ 
  tasks, 
  projects, 
  groupBy, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onView 
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupedTasks = () => {
    const groups: Record<string, Task[]> = {};

    tasks.forEach(task => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'status':
          groupKey = task.status;
          break;
        case 'project':
          const project = projects.find(p => p.id === task.project_id);
          groupKey = project ? project.name : 'No Project';
          break;
        case 'priority':
          groupKey = task.priority;
          break;
        default:
          groupKey = 'Other';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return groups;
  };

  const groupedTasks = getGroupedTasks();
  const groupKeys = Object.keys(groupedTasks).sort();

  const getGroupColor = (groupKey: string) => {
    switch (groupBy) {
      case 'status':
        return groupKey === 'Done' ? 'text-green-400' : 
               groupKey === 'In Progress' ? 'text-orange-400' : 'text-slate-400';
      case 'priority':
        return groupKey === 'Critical' ? 'text-red-600' :
               groupKey === 'High' ? 'text-red-400' :
               groupKey === 'Medium' ? 'text-yellow-400' : 'text-green-400';
      case 'project':
        const project = projects.find(p => p.name === groupKey);
        return project ? 'text-cyan-400' : 'text-slate-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {groupKeys.map((groupKey) => {
        const groupTasks = groupedTasks[groupKey];
        const isExpanded = expandedGroups.has(groupKey);
        
        return (
          <div key={groupKey} className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleGroup(groupKey)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <h3 className={`font-semibold text-lg ${getGroupColor(groupKey)}`}>
                  {groupKey}
                </h3>
                <span className="bg-slate-700/50 text-slate-300 text-sm px-2 py-1 rounded-full">
                  {groupTasks.length}
                </span>
              </div>
            </button>
            
            {isExpanded && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleComplete={onToggleComplete}
                      onViewDetails={onView}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {groupKeys.length === 0 && (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">No tasks to display</p>
        </div>
      )}
    </div>
  );
};

export default TaskGroupedView;

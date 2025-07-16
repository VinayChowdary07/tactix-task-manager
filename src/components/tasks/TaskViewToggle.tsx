
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, Kanban, Calendar } from 'lucide-react';

export type TaskView = 'list' | 'grouped' | 'kanban' | 'timeline';

interface TaskViewToggleProps {
  viewType: TaskView;
  onViewChange: (view: TaskView) => void;
}

const TaskViewToggle: React.FC<TaskViewToggleProps> = ({ viewType, onViewChange }) => {
  const views = [
    { id: 'list' as const, label: 'List', icon: List },
    { id: 'grouped' as const, label: 'Grouped', icon: LayoutGrid },
    { id: 'kanban' as const, label: 'Kanban', icon: Kanban },
    { id: 'timeline' as const, label: 'Timeline', icon: Calendar },
  ];

  return (
    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-2">
      {views.map((view) => (
        <Button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          variant={viewType === view.id ? 'default' : 'ghost'}
          size="sm"
          className={`flex items-center gap-2 transition-all ${
            viewType === view.id
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <view.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default TaskViewToggle;

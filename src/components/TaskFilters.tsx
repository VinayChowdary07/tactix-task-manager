
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, X, Flag, CheckCircle } from 'lucide-react';

export interface TaskFilters {
  search: string;
  priority: string;
  status: string;
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  className?: string;
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  className
}) => {
  const updateFilter = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      priority: 'all',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.search || 
    filters.priority !== 'all' || 
    filters.status !== 'all';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search tasks by title or description..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm font-medium">Filters:</span>
        </div>

        {/* Priority Filter */}
        <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400">
            <Flag className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-slate-400">All Priorities</SelectItem>
            <SelectItem value="Critical" className="text-red-400">Critical</SelectItem>
            <SelectItem value="High" className="text-red-400">High</SelectItem>
            <SelectItem value="Medium" className="text-yellow-400">Medium</SelectItem>
            <SelectItem value="Low" className="text-green-400">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600 text-white focus:border-cyan-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-slate-400">All Status</SelectItem>
            <SelectItem value="Todo" className="text-slate-400">Todo</SelectItem>
            <SelectItem value="In Progress" className="text-blue-400">In Progress</SelectItem>
            <SelectItem value="Done" className="text-green-400">Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllFilters}
            className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Display */}
      {(filters.priority !== 'all' || filters.status !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {filters.priority !== 'all' && (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 border-orange-500/50 cursor-pointer rounded border"
              onClick={() => updateFilter('priority', 'all')}
            >
              <Flag className="w-3 h-3" />
              {filters.priority}
              <X className="w-3 h-3 ml-1" />
            </div>
          )}
          
          {filters.status !== 'all' && (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 border-blue-500/50 cursor-pointer rounded border"
              onClick={() => updateFilter('status', 'all')}
            >
              <CheckCircle className="w-3 h-3" />
              {filters.status}
              <X className="w-3 h-3 ml-1" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFiltersComponent;

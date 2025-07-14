
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, CheckCircle2, Clock, Star, Loader2 } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import TaskModal from '@/components/TaskModal';
import TaskCard from '@/components/TaskCard';
import TaskFiltersComponent, { TaskFilters } from '@/components/TaskFilters';
import { useOutletContext } from 'react-router-dom';

interface OutletContext {
  selectedProjectId: string | null;
  projects: Array<{ id: string; name: string; color?: string }>;
  setSelectedProjectId?: (id: string | null) => void;
}

const Tasks = () => {
  const { tasks, isLoading, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Safely get context with fallback
  const context = useOutletContext<OutletContext>();
  const selectedProjectId = context?.selectedProjectId || null;

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    priority: 'all',
    status: 'all',
    tagIds: []
  });

  // Filter tasks based on all criteria
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by selected project if any
    if (selectedProjectId) {
      filtered = filtered.filter(task => task.project_id === selectedProjectId);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.name.toLowerCase().includes(searchLower))
      );
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply tag filters
    if (filters.tagIds.length > 0) {
      filtered = filtered.filter(task => 
        task.tags?.some(tag => filters.tagIds.includes(tag.id))
      );
    }

    return filtered;
  }, [tasks, selectedProjectId, filters]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Calculate stats from filtered data
  const todoTasks = filteredTasks.filter(task => task.status === 'Todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'In Progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'Done');
  const highPriorityTasks = filteredTasks.filter(task => task.priority === 'High' || task.priority === 'Critical');

  const stats = [
    { label: selectedProjectId ? 'Project Tasks' : 'Total Tasks', value: filteredTasks.length.toString(), icon: Target, color: 'text-cyan-400' },
    { label: 'Completed', value: completedTasks.length.toString(), icon: CheckCircle2, color: 'text-green-400' },
    { label: 'In Progress', value: inProgressTasks.length.toString(), icon: Clock, color: 'text-blue-400' },
    { label: 'High Priority', value: highPriorityTasks.length.toString(), icon: Star, color: 'text-red-400' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-dark border-slate-700/50 hover:glow-cyan transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Header with Create Task Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            {selectedProjectId ? 'Project Tasks' : 'Your Tasks'}
          </h2>
          <p className="text-slate-400">
            {selectedProjectId 
              ? `Tasks for ${projects.find(p => p.id === selectedProjectId)?.name || 'this project'}`
              : 'Manage and track your productivity'
            }
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Smart Filters */}
      <TaskFiltersComponent 
        filters={filters}
        onFiltersChange={setFilters}
        className="glass-dark border-slate-700/50 p-6 rounded-lg"
      />

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            {filters.search || filters.priority !== 'all' || filters.status !== 'all' || filters.tagIds.length > 0
              ? 'No tasks match your filters'
              : selectedProjectId 
                ? 'No tasks in this project'
                : 'No tasks yet'
            }
          </h3>
          <p className="text-slate-400 mb-4">
            {filters.search || filters.priority !== 'all' || filters.status !== 'all' || filters.tagIds.length > 0
              ? 'Try adjusting your search criteria or filters'
              : selectedProjectId 
                ? 'Create your first task for this project to get started'
                : 'Create your first task to get started with productivity tracking'
            }
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projects={projects}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        onClick={() => setIsModalOpen(true)}
        size="lg"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-cyber glow-cyan shadow-2xl hover:scale-110 transition-all z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
        defaultProjectId={selectedProjectId}
      />
    </div>
  );
};

export default Tasks;

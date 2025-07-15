
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Filter, Search, Calendar, Target } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import TaskFilters, { TaskFilters as TaskFiltersType } from '@/components/TaskFilters';
import { Input } from '@/components/ui/input';

const Tasks = () => {
  const { tasks, isLoading, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: '',
    priority: 'all',
    status: 'all'
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesFilterSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesSearch && matchesPriority && matchesStatus && matchesFilterSearch;
  });

  const handleEditTask = (task: any) => {
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

  const getStatsCards = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length;

    return [
      { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-cyan-400' },
      { label: 'In Progress', value: inProgressTasks, icon: Target, color: 'text-blue-400' },
      { label: 'Completed', value: completedTasks, icon: CheckSquare, color: 'text-green-400' },
      { label: 'Overdue', value: overdueTasks, icon: Calendar, color: 'text-red-400' },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Tasks Dashboard
            </h1>
            <p className="text-slate-400">Manage your tasks and track progress efficiently</p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsCards().map((stat, index) => (
            <div
              key={index}
              className="glass-card neon-border-blue hover:neon-glow-blue transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-slate-800/50 ${stat.color.replace('text-', 'text-')} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="glass-card neon-border-blue">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:border-cyan-400 transition-all whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {showFilters ? '▲' : '▼'}
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-700/50 animate-fade-in">
              <TaskFilters 
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          )}
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 glass-card neon-border-blue">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-blue">
              <CheckSquare className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filters.search || filters.priority !== 'all' || filters.status !== 'all' ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              {searchTerm || filters.search || filters.priority !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your search criteria or clear filters to see more tasks.'
                : 'Start by creating your first task to organize your work and track progress efficiently.'
              }
            </p>
            {(!searchTerm && !filters.search && filters.priority === 'all' && filters.status === 'all') && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <TaskCard
                  task={task}
                  projects={projects}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-2xl hover:shadow-cyan-500/50 hover:scale-110 transition-all z-50 neon-glow-blue"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={editingTask}
        />
      </div>
    </div>
  );
};

export default Tasks;
